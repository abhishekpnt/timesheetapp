import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import Accordion from './components/reuse/Accordion/Accordion'; // Adjust path as needed
import Time from './assets/img/time.svg';
import Calender from './assets/img/calender.svg';
import Log from './assets/img/log.svg';

import CalendarPicker from 'react-native-calendar-picker';
import Header from './components/sticky/header/Header';
import * as mockData from './assets/mock/overview.json'; // Import the mock JSON
import { TextInput, Chip, Button, PaperProvider, SegmentedButtons, Card, Paragraph } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';

type ExpandedStateType = {
  [key: string]: boolean;
};
const App: React.FC = () => {
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
  const [totalTime, setTotalTime] = useState<any>('')
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [location, setLocation] = React.useState('Tarento Office');

  const projects = [
    { label: 'Training', value: 'Training' },
    { label: 'Escalation', value: 'Escalation' },


    // Add more projects
  ];

  const tasks = [
    { label: 'Task A', value: 'taskA' },
    { label: 'Task B', value: 'taskB' },
    // Add more tasks
  ];

  const locations = [
    {
      value: 'Tarento Office',
      label: 'Tarento Office',
    },
    {
      value: 'Client Site',
      label: 'Client Site',
    },
    { value: 'WFH', label: 'WFH' },
  ]


  useEffect(() => {
    const currentWeekRange = getCurrentWeekRange();
    setWeekRange(currentWeekRange);
    setAccordionTitle(formatWeekRange(currentWeekRange.start, currentWeekRange.end));
    setCalendarDate(new Date(currentWeekRange.start));
    setCalendarKey(prev => prev + 1); // Force CalendarPicker to re-render
    fetchData(currentWeekRange.start, currentWeekRange.end); // Fetch data on initial load
  }, []);

  useEffect(() => {
    fetchData(weekRange.start, weekRange.end); // Fetch data when weekRange changes
  }, [weekRange]);

  // Mock fetchData function
  const fetchData = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      // Simulate network delay
      setTimeout(() => {
        const fetchedData = mockData.responseData;
        setData(fetchedData);
        const totalTime = fetchedData.reduce((acc, item: any) => {
          return acc + (item.timeReportForDate ? item.timeReportForDate.reduce((sum: number, report: any) => sum + report.workHour, 0) : 0);
        }, 0);
        const formattedTime = convertMinutesToHoursAndMinutes(totalTime);
        setTotalTime(formattedTime);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err);
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
    setCalendarKey(prev => prev + 1); // Force CalendarPicker to re-render
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

  const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = (day < 1 ? -6 : 1) - day;
    return new Date(date.setDate(date.getDate() + diff));
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return {
      start: startOfWeek.toDateString(),
      end: endOfWeek.toDateString(),
    };
  };

  const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startFormatted = startDate.toLocaleDateString('en-US', options);
    const endFormatted = endDate.toLocaleDateString('en-US', options);
    const weekNumber = getWeekNumber(startDate);
    return `${startFormatted} - ${endFormatted} [Week-${weekNumber}]`;
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
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
      setCalendarKey(prev => prev + 1); // Force CalendarPicker to re-render
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
      setCalendarKey(prev => prev + 1); // Force CalendarPicker to re-render
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
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimesheetInput('');
    setSelectedProject('');
    setSelectedTask('');
    setHours('');
    setMinutes('');
    setLocation('')
  };

  const updateTimesheet = () => {
    console.log(`Timesheet for ${selectedDate}: ${timesheetInput}`);
    closeModal();
  };

  const convertMinutesToHoursAndMinutes = (minutes: any) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}H ${mins}M`;
  };

  const openModalWithData = (date: string, report: any) => {
    console.log('inside')
    setSelectedDate(date);
    setTimesheetInput(report.activityNote || '');
    setSelectedProject(report.projectName || '');
    setSelectedTask(report.taskName || '');
    setHours(Math.floor(report.workHour / 60).toString());
    setMinutes((report.workHour % 60).toString());
    setLocation(report.locName || 'Tarento Office');
    setModalVisible(true);
  };

  // const calculateTotalTime = (reports: any[]) => {
  //   const totalMinutes = reports.reduce((acc, report) => acc + report.workHour, 0);
  //   return convertMinutesToHoursAndMinutes(totalMinutes);
  // };
  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>

        <View style={styles.container}>
          <ScrollView style={styles.container}>
            <Header />
            <Accordion
              title={totalTime}
              iconSource={<Time />} // Dynamically passed image
              isAccordion={false} // Static content, no toggle
              showButtons={false} // Hide the +/- buttons
            />
            <Accordion
              title={accordionTitle}
              iconSource={<Calender />} // Dynamically passed image
              content={
                <View>
                  <CalendarPicker
                    key={calendarKey} // Force re-render on week change
                    startFromMonday={true}
                    onDateChange={onDateChange}
                    initialDate={calendarDate}
                  // selectedStartDate={calendarDate}
                  />
                </View>
              }
              isAccordion={true}
              expanded={isAccordionExpanded}
              onToggle={toggleAccordion}
              showButtons={false} // Hide the +/- buttons
              showWeekButtons={!isAccordionExpanded} // Conditionally render week buttons
              onWeekChange={handleWeekChange}
            />


            {mockData.responseData.map((item: any) => (
              <Accordion iconSource={<Log />} key={item.workDate} title={item.workDate}
                content={
                  <View>
                    {item.timeReportForDate && item.timeReportForDate.length > 0 && (
                      <>
                        {item.timeReportForDate.map((report: any, index: number) => (
                          <Accordion
                            title={report.taskName}
                            description={convertMinutesToHoursAndMinutes(report.workHour)}// Dynamically passed image
                            isAccordion={true} // Static content, no toggle
                            showButtons={false} // Hide the +/- buttons
                            content={
                              <View>
                                <Text>{report.projectName}</Text>
                              </View>
                            }
                            expanded={true}
                            onPress={() => openModalWithData(item.workDate, report)}
                          >
                          </Accordion>
                        ))}


                      </>
                    )}
                    <Button
                      style={styles.button}
                      mode="contained"
                      onPress={() => openModal(item.workDate)}
                    >
                      +
                    </Button>
                  </View>
                }
                isAccordion={true}
                expanded={expandedState[item.workDate]}
                onToggle={() => toggleAcc(item.workDate)}
                showButtons={true} // Hide the +/- buttons
              />
            ))}
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
                    <Chip style={styles.modalText} >Add/Edit Timesheet for {selectedDate}</Chip>
                    <TextInput
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
                      iconStyle={styles.iconStyle}
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
                      iconStyle={styles.iconStyle}
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

                    <TextInput
                      style={styles.input}
                      onChangeText={setHours}
                      value={hours}
                      placeholder="Hours"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      onChangeText={setMinutes}
                      value={minutes}
                      placeholder="Minutes"
                      keyboardType="numeric"
                    />
                    <SegmentedButtons
                      value={location}
                      onValueChange={setLocation}
                      buttons={locations}
                    />

                    <View style={styles.buttonContainer}>
                      {<Button mode="elevated" onPress={updateTimesheet} children={'Update'} />}
                      {/* <Button title="Cancel" onPress={closeModal} /> */}
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
    height: '100%',
  },
  dataContainer: {
    padding: 20,
  },
  modalView: {
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
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    // paddingHorizontal: 10,
    marginBottom: 15,
    width: '160%',

  },

  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
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
    width: 100,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    marginBottom: 10
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    width: 100,
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  listContainer: {
    width: 100
  }

});

export default App;
