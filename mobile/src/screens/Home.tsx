import { Text, View, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning';

import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { Header } from "../components/Header";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import dayjs from "dayjs";

type SummaryProps = {
	id: string
	date: string
	amount: number
	completed: number
}[];

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const datesFromYearStart = generateDatesFromYearBeginning();
const minimumSumaryDatesSizes = 18 * 5;
const amountOfDaysToFill = minimumSumaryDatesSizes - datesFromYearStart.length;

export function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryProps | null>(null);

  const { navigate } = useNavigation();

  async function fetchData() {
    try {
      setLoading(true);
      //const response = await api.get('summary');
      //setSummary(response.data.summary);

      let REMOVE = [
        {
          "id": "db06e8b3-598c-4a76-9350-c468d01eadba",
          "date": "2023-01-06T03:00:00.000Z",
          "completed": 1,
          "amount": 1
        },
        {
          "id": "181e36f7-36ef-457c-8bec-083e7f98d082",
          "date": "2023-01-02T03:00:00.000Z",
          "completed": 1,
          "amount": 1
        },
        {
          "id": "77a719a9-5878-4f54-a1de-5de83c874ca0",
          "date": "2023-01-04T03:00:00.000Z",
          "completed": 2,
          "amount": 2
        },
        {
          "id": "e57c2c3b-9989-4660-9fe7-7fe034b62493",
          "date": "2023-02-26T03:00:00.000Z",
          "completed": 1,
          "amount": 4
        }
      ];
      setSummary(REMOVE);
    } catch (error) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos.')
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />
      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, i) => (
          <Text 
            key={`${weekDay}-${i}`}
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            style={{width: DAY_SIZE}}
          >
            {weekDay}
          </Text>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
        {summary &&
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map(date => {
              const dayInSummary = summary.find(day => {
                return dayjs(date).isSame(day.date, 'day');
              });
  
              return (
                <HabitDay 
                  key={date.toISOString()}
                  date={date}
                  amountOfHabits={dayInSummary?.amount} 
                  amountOfCompleted={dayInSummary?.completed}
                  onPress={() => navigate('habit', {date: date.toISOString()})}
                />
              )
            })}
  
            {amountOfDaysToFill > 0 && Array
            .from({length: amountOfDaysToFill})
            .map((_, index) => (
              <View
                key={index}
                className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                style={{width: DAY_SIZE, height: DAY_SIZE}}
              />
            ))}
          </View>
        }
      </ScrollView>
    </View>
  );
}