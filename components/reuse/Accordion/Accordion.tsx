import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Left from '../../../assets/img/left.svg';
import Right from '../../../assets/img/right.svg';
import { Card } from 'react-native-paper';

interface AccordionProps {
  title: string;
  description?: string;
  iconSource?: any;
  children?: React.ReactNode;
  isAccordion?: boolean;
  showButtons?: boolean;
  expanded?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
  showWeekButtons?: boolean; // New prop for week buttons visibility
  onWeekChange?: (direction: 'left' | 'right') => void;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  iconSource,
  children,
  isAccordion = false,
  showButtons = true,
  expanded = false,
  onToggle,
  showWeekButtons = false, // Default to true
  onWeekChange,
  description = '',
  onPress
}) => {
  return (
    <Card style={styles.container}>
      <TouchableOpacity onPress={() => {
        if (onToggle) onToggle();
        if (onPress) onPress();
      }}>
        <View style={styles.header}>
          {iconSource && (
            <View style={styles.icon}>
              {iconSource}
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
          {description && <Text style={styles.description}>{description}</Text>}
          {isAccordion && showButtons && (
            <View style={styles.buttons}>
              <Text style={styles.button}>{expanded ? '-' : '+'}</Text>
            </View>
          )}
          {showWeekButtons && (
            <View style={styles.weekButtonsContainer}>
              <TouchableOpacity
                style={styles.weekButton}
                onPress={() => onWeekChange?.('left')}
              >
                <Left width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.weekButton}
                onPress={() => onWeekChange?.('right')}
              >
                <Right width={24} height={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
      {isAccordion && expanded && (
        <TouchableOpacity onPress={() => {
          if (onPress) onPress();
        }}>
          <View style={styles.children}>
            {children}
          </View>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    // borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: 'white',
    // shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    padding: 10,
    width: '95%',
    margin: 'auto',
    color: '#000000'

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    color: '#000000'

  },
  icon: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    width: '60%',
    justifyContent: 'center',
    color: '#000000'

  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000'
  },
  buttons: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#000000'

  },
  weekButtonsContainer: {
    flexDirection: 'row',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekButton: {
    marginHorizontal: 5,
  },
  children: {
    marginTop: 10,
    color: '#000000'

  },
  description: {
    fontSize: 12,
    color: '#000000'

  }
});

export default Accordion;
