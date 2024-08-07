import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import Accordion from '../reuse/Accordion/Accordion'; // Adjust path as needed
import Time from '../../assets/img/time.svg';
import Calender from '../../assets/img/calender.svg';
import Log from '../../assets/img/log.svg';
import CalendarPicker from 'react-native-calendar-picker';
import Header from '../sticky/header/Header';
import { TextInput, Chip, Button, PaperProvider, SegmentedButtons, } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { customTheme } from '../../assets/theme';
import { fetchProjectsAndTasks, fetchData, saveData, updateData } from '../../services/apiService'; // Import the API functions
import { convertDateFormat, getStartOfWeek, getCurrentWeekRange, formatWeekRange, getWeekNumber } from '../../services/dateUtil';
import uuid from 'react-native-uuid';


type ExpandedStateType = {
  [key: string]: boolean;
};

const Timesheet: React.FC = () => {
  const [weekRange, setWeekRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [isAccordionExpanded, setAccordionExpanded] = useState(false);
  const [accordionTitle, setAccordionTitle] = useState('');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarKey, setCalendarKey] = useState<number>(0); // Key to force re-render
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [expandedState, setExpandedState] = useState<ExpandedStateType>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timesheetInput, setTimesheetInput] = useState<string>('');
  const [totalTime, setTotalTime] = useState<any>('');
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [location, setLocation] = useState('Tarento Office');
  const { profile, token } = useAuth(); // Access the token from AuthContext

  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectTasksMap, setProjectTasksMap] = useState<Map<number, any[]>>(new Map());
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [activityRefNumber, setActivityRefNumber] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const locations = [
    { value: 'Tarento Office', label: 'Tarento Office' },
    { value: 'Client Site', label: 'Client Site' },
    { value: 'WFH', label: 'WFH' },
  ];

  useEffect(() => {
    const currentWeekRange = getCurrentWeekRange();
    setWeekRange(currentWeekRange);
    setAccordionTitle(formatWeekRange(currentWeekRange.start, currentWeekRange.end));
    setCalendarDate(new Date(currentWeekRange.start));
    const formattedDates = convertDateFormat(currentWeekRange);
    fetchInitialData(formattedDates.startDate, formattedDates.endDate);
  }, []);

  useEffect(() => {
    fetchProjectsAndTasksData();
  }, []);

  useEffect(() => {
    const formattedDates = convertDateFormat(weekRange);
    fetchInitialData(formattedDates.startDate, formattedDates.endDate); // Fetch data when weekRange changes
  }, [weekRange]);


  const fetchProjectsAndTasksData = async () => {
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      const responseData = await fetchProjectsAndTasks(token);
      const projectList = responseData.projectList;
      const projectTaskMap = responseData.projectTaskMap;
      const taskList = responseData.taskList;

      const projectOptions = projectList.map((project: any) => ({
        value: project.id,
        label: project.name,
        // billabaale:project.
      }));

      const taskOptions = taskList.map((task: any) => ({
        value: task.id,
        label: task.name,
      }));

      const taskMap = new Map<number, string>();
      taskList.forEach((task: any) => taskMap.set(task.id, task.name));

      const projectTasks = new Map<number, any[]>();
      projectTaskMap.forEach((projectMap: any) => {
        projectTasks.set(projectMap.projectId, projectMap.taskList.map((taskId: number) => ({
          value: taskId,
          label: taskMap.get(taskId),
        })));
      });

      setProjects(projectOptions);
      setProjectTasksMap(projectTasks);
    } catch (err) {
      console.error('Error fetching projects and tasks:', err);
    }
  };

  const fetchInitialData = async (startDate: string, endDate: string) => {
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      setLoading(true);
      const responseData = await fetchData(token, startDate, endDate);
      console.log('responseData', responseData)

      const sortedData = responseData && responseData.sort((a: { workDate: string | number | Date; }, b: { workDate: string | number | Date; }) => {
        const dateA = new Date(a.workDate);
        const dateB = new Date(b.workDate);
        return dateA.getTime() - dateB.getTime();

      });
      setData(sortedData);

      const totalTime = (sortedData || []).reduce((acc: number, item: any) => {
        return acc + ((item.timeReportForDate && item.timeReportForDate.length > 0) ? item.timeReportForDate.reduce((sum: number, report: any) => sum + report.workHour, 0) : 0);
      }, 0);
      const formattedTime = convertMinutesToHoursAndMinutes(totalTime);
      setTotalTime(formattedTime);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (date: any) => {
    const selectedDate = new Date(date);
    console.log('Selected Date:', selectedDate);

    const startOfWeek = getStartOfWeek(selectedDate);
    console.log('Start of Week:', startOfWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    console.log('End of Week:', endOfWeek);

    const newWeekRange = {
      start: startOfWeek.toDateString(),
      end: endOfWeek.toDateString(),
    };

    setWeekRange(newWeekRange);
    setAccordionTitle(formatWeekRange(newWeekRange.start, newWeekRange.end));
    setCalendarDate(startOfWeek);
    // setCalendarKey(prev => prev + 1); // Force CalendarPicker to re-render
    setAccordionExpanded(false); // Close the accordion when a date is selected

    // Close all accordions
    setExpandedState(prevState => {
      const newState: ExpandedStateType = {};
      Object.keys(prevState).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  };

  const handleWeekChange = (direction: 'left' | 'right') => {
    const currentStartDate = new Date(weekRange.start);

    if (direction === 'left') {
      const newStartOfWeek = new Date(currentStartDate);
      newStartOfWeek.setDate(currentStartDate.getDate() - 7);
      const newEndOfWeek = new Date(newStartOfWeek);
      newEndOfWeek.setDate(newStartOfWeek.getDate() + 6);

      const newWeekRange = {
        start: newStartOfWeek.toDateString(),
        end: newEndOfWeek.toDateString(),
      };

      setWeekRange(newWeekRange);
      setAccordionTitle(formatWeekRange(newWeekRange.start, newWeekRange.end));
      setCalendarDate(newStartOfWeek);
    } else if (direction === 'right') {
      const newStartOfWeek = new Date(currentStartDate);
      newStartOfWeek.setDate(currentStartDate.getDate() + 7);
      const newEndOfWeek = new Date(newStartOfWeek);
      newEndOfWeek.setDate(newStartOfWeek.getDate() + 6);

      const newWeekRange = {
        start: newStartOfWeek.toDateString(),
        end: newEndOfWeek.toDateString(),
      };

      setWeekRange(newWeekRange);
      setAccordionTitle(formatWeekRange(newWeekRange.start, newWeekRange.end));
      setCalendarDate(newStartOfWeek);
    }

    setExpandedState(prevState => {
      const newState: ExpandedStateType = {};
      Object.keys(prevState).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  };

  const toggleAccordion = () => {
    setAccordionExpanded(prev => !prev);
  };
  const toggleAcc = (id: any) => {
    setExpandedState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  }

  const openModal = (date: string) => {
    setSelectedDate(date);
    setLocation('Tarento Office')
    setModalVisible(true);
    setIsEditing(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimesheetInput('');
    setSelectedProject(null);
    setSelectedTask(null);
    setHours('');
    setMinutes('');
    setLocation('')
  };

  const updateTimesheet = async () => {
    if (!token) {
      console.error('No token found');
      return;
    }

    const payload = {
      time: [
        {
          date: selectedDate,
          pid: selectedProject,
          tid: selectedTask,
          minute: parseInt(hours) * 60 || 0 + parseInt(minutes) || 0,
          note: timesheetInput,
          locId: location === 'Tarento Office' ? 8 : location === 'Client Site' ? 9 : 10, // Adjust as per your location IDs
          onSite: false,
          activityRefNumber: `${profile.email}#${uuid.v4()}`
        }
      ]
    };

    try {
      let response = await saveData(token, payload)
      if (response.statusCode == 200 && response.statusMessage == 'Success') {
        const formattedDates = convertDateFormat(weekRange);
        fetchInitialData(formattedDates.startDate, formattedDates.endDate); // Refresh the data
        closeModal();
      } else {
        Alert.alert('Please fill the required details')
        //  console.error('Failed to update timesheet:', response.statusText);
      }

    } catch (error) {
      console.error('Error updating timesheet:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const convertMinutesToHoursAndMinutes = (minutes: any) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}H ${mins}M`;
  };

  const isFormValid = () => {
    return (
      timesheetInput.trim() !== '' &&
      selectedProject !== null &&
      selectedTask !== null &&
      hours.trim() !== '' &&
      minutes.trim() !== ''
    );
  };
  
  const openModalWithData = (date: string, report: any) => {
    console.table('report', report);

    // Set state values first
    setSelectedDate(date);
    setTimesheetInput(report.activityNote || '');
    setSelectedProject(report.projectId);
    setSelectedTask(report.taskId);
    setHours(Math.floor(report.workHour / 60).toString());
    setMinutes((report.workHour % 60).toString());
    setLocation(report.locName || 'Tarento Office');
    setActivityRefNumber(report.activityRefNumber); // Set activityRefNumber from report
    setModalVisible(true);
    setIsEditing(true);
  };

  const updateTimesheetWithData = async () => {
    if (!token) {
      console.error('No token found');
      return;
    }

    const payload = {
      time: [
        {
          date: selectedDate,
          pid: selectedProject,
          tid: selectedTask,
          minute: parseInt(hours) * 60 + parseInt(minutes),
          note: timesheetInput,
          locId: location === 'Tarento Office' ? 8 : location === 'Client Site' ? 9 : 10, // Adjust as per your location IDs
          onSite: false,
          activityRefNumber: activityRefNumber, // Use the activityRefNumber from state
        },
      ],
    };

    try {
      let response = await updateData(token, payload);
      if (response.statusCode === 200 && response.statusMessage === 'Success') {
        console.log('weekRange', weekRange);
        const formattedDates = convertDateFormat(weekRange);
        fetchInitialData(formattedDates.startDate, formattedDates.endDate); // Refresh the data
        closeModal();
      } else {
        // console.error('Failed to update timesheet:', response.statusText);
        Alert.alert('Please fill the required details')

      }
    } catch (error) {
      console.error('Error updating timesheet:', error);
      // Handle error (e.g., show an error message)
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <ScrollView >
            <View style={styles.headerContainer}><Header /></View>
            <View style={styles.firstCard}>
              <Accordion
                title={totalTime}
                iconSource={<Time />} // Dynamically passed image
                isAccordion={false} // Static content, no toggle
                showButtons={false} // Hide the +/- buttons
              />
            </View>

            <View style={styles.cardContainer}>
              <Accordion
                title={accordionTitle}
                iconSource={<Calender />} // Dynamically passed image
                isAccordion={true}
                expanded={isAccordionExpanded}
                onToggle={toggleAccordion}
                showButtons={false} // Hide the +/- buttons
                showWeekButtons={!isAccordionExpanded} // Conditionally render week buttons
                onWeekChange={handleWeekChange}
              >
                <View>
                  <CalendarPicker
                    key={calendarKey} // Force re-render on week change
                    startFromMonday={true}
                    onDateChange={onDateChange}
                    initialDate={calendarDate}
                  // selectedStartDate={calendarDate}
                  />
                </View>
              </Accordion>

              {data && data.map((item: any) => (
                <Accordion iconSource={<Log />} key={item.workDate} title={item.workDate}

                  isAccordion={true}
                  expanded={expandedState[item.workDate]}
                  onToggle={() => toggleAcc(item.workDate)}
                  showButtons={true} // Hide the +/- buttons
                >
                  <View>
                    {item.timeReportForDate && item.timeReportForDate.length > 0 && (
                      <>
                        {item.timeReportForDate.map((report: any, index: number) => (
                          <Accordion
                            key={`${item.workDate}-${index}`}
                            title={report.taskName}
                            description={convertMinutesToHoursAndMinutes(report.workHour)}// Dynamically passed image
                            isAccordion={true} // Static content, no toggle
                            showButtons={false} // Hide the +/- buttons
                            expanded={true}
                            onPress={() => !item.lockStatus && openModalWithData(item.workDate, report)}
                          >
                            <View>
                              <Text style={{ color: "#000" }}>{report.projectName}</Text>
                            </View>
                          </Accordion>
                        ))}
                      </>
                    )}
                    {(!item.lockStatus) && <Button
                      style={styles.button}
                      mode="contained"
                      onPress={() => openModal(item.workDate)}
                    >
                      +
                    </Button>}
                  </View>
                </Accordion>
              ))}
            </View>

          </ScrollView>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalView}>
                    <Chip style={styles.modalText} > {isEditing ? 'Update' : 'Add'} Timesheet for {selectedDate}</Chip>
                    <TextInput
                      multiline={false}
                      numberOfLines={1}
                      style={styles.input}
                      onChangeText={text => setTimesheetInput(text)}
                      value={timesheetInput}
                      placeholder="Activity"
                    />
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      containerStyle={styles.listContainer}
                      itemTextStyle={styles.itemTextStyle}
                      itemContainerStyle={styles.itemContainerStyle}

                      // iconStyle={styles.iconStyle}
                      data={projects}
                      mode='auto'
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Select Project"
                      searchPlaceholder="Search"
                      value={selectedProject}
                      onChange={item => {
                        setSelectedProject(item.value);
                        // Update tasks based on the selected project
                        const relatedTasks = projectTasksMap.get(item.value) || [];
                        setTasks(relatedTasks);
                      }}
                    // renderLeftIcon={() => (
                    //   // <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                    // )}
                    />

                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      containerStyle={styles.listContainer}
                      itemTextStyle={styles.itemTextStyle}
                      itemContainerStyle={styles.itemContainerStyle}
                      data={tasks}
                      mode='auto'
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder="Select Task"
                      searchPlaceholder="Search"
                      value={selectedTask}
                      onChange={item => {
                        setSelectedTask(item.value);
                      }}
                    />
                    <View style={styles.time}>
                      <TextInput
                        multiline={false}
                        numberOfLines={1}

                        style={styles.input}
                        onChangeText={setHours}
                        value={hours}
                        placeholder="Hour"
                        keyboardType="numeric"
                      />
                      <TextInput
                        multiline={false}
                        numberOfLines={1}

                        style={styles.input}
                        onChangeText={setMinutes}
                        value={minutes}
                        placeholder="Minute"
                        keyboardType="numeric"
                      />
                    </View>
                    <SegmentedButtons
                      value={location}
                      onValueChange={setLocation}
                      buttons={locations}
                    />

                    <View style={styles.buttonContainer}>
                      <Button
                        mode="outlined"
                        onPress={isEditing ? updateTimesheetWithData : updateTimesheet}
                        disabled={!isFormValid()}
                      >
                        {isEditing ? 'Update' : 'Add'}
                      </Button>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </SafeAreaProvider>
    </PaperProvider>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    height: 100,
    color: '#323F4E'
  },
  headerContainer: {
    // position: 'relative',
    zIndex: -1
  },
  firstCard: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
    color: '#000000'

  },
  itemTextStyle: {
    width: 100,
    color: '#000000',
    fontSize: 12
  },
  cardContainer: {
    color: 'black',
    marginTop: 20
  },
  dataContainer: {
    padding: 20,
  },
  modalView: {
    fontSize: 16,
    margin: 20,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    // top: '10%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 100,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    minWidth: 75,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    // textAlignVertical:'auto',
    // includeFontPadding:false,
    // paddingHorizontal: 10,
    marginBottom: 15,
    // width: '180%',
    fontSize: 12,
    padding: 0,
    textAlign: 'center',
    // lineHeight: undefined,
    //         flexWrap: 'wrap',
    // backgroundColor:'grey',
    // color: '#323F4E'


  },
  time: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    width: '30%',
    margin: 'auto',
    marginTop: 10
  },
  dropdown: {
    // margin: 16,
    height: 50,
    width: 140,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    marginBottom: 10,
    color: '#000000'
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    width: 170,
    fontSize: 16,
    color: '#000000'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000000'
  },
  itemContainerStyle: {
    width: 150,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#000000'
  },
  listContainer: {
    width: 140,
    color: '#000000',
  }

});

export default Timesheet;
