import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    })

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map( weekDay => {
            return {
              week_day: weekDay
            }
          })
        }
      }
    })
  });

  app.get('/day', async (request) => {
		// Faz com que os parâmetros sejam do tipo date, porém convertido para String
		const getDayParams = z.object({
			date: z.coerce.date(),
		})

		// Recebe os parâmetros da rota (localhost:3333/day?date=2023-01-29T00)
		const { date } = getDayParams.parse(request.query)
		// FIXME: Requisição nao retorna nada se o horário não for diferente de 00:00:00:000z
		const parsedDate = dayjs(date).startOf('day')

		// Recebe o dia da semana em Int
		const weekDay = parsedDate.get('day')

		// Buscar todos os hábitos possíveis no dia selecionado
		const possibleHabits = await prisma.habit.findMany({
			where: {
				// Buscar uma data de criação que seja menor ou igual
				created_at: {
					lte: date,
				},
				// Buscar hábitos onde tenha algum dia da semana que preenche os requisitos
				weekDays: {
					some: {
						week_day: weekDay,
					},
				},
			},
		})

		// Buscar informações do dia
		const day = await prisma.day.findUnique({
			where: {
				date: parsedDate.toDate(),
			},
			include: {
				dayHabits: true,
			},
		})

		// Variável que recebe o dia em que o hábito foi completado, caso não existir (null) (? verifica se é nulo), ele retorna os id's dos hábitos que foram completados na model dayHabits
		const completedHabits =
			day?.dayHabits.map((dayHabit) => {
				return dayHabit.habit_id
			}) ?? []

		return {
			possibleHabits,
			completedHabits,
		}
	});

	app.patch('/habits/:id/toggle', async (request) => {
		const toggleHabitParams = z.object({
			id: z.string().uuid(),
		});

		const { id } = toggleHabitParams.parse(request.params);
		
		const today = dayjs().startOf('day').toDate();

		let day = await prisma.day.findUnique({
			where: {
				date: today,
			}
		});

		if(!day) {
			day = await prisma.day.create({
				data: {
					date: today,
				}
			});
		}

		const dayHabit = await prisma.dayHabit.findUnique({
			where: {
				day_id_habit_id: {
					day_id: day.id,
					habit_id: id,
				}
			}
		});

		console.log(dayHabit);

		if(dayHabit) {
			await prisma.dayHabit.delete({
				where: {
					id: dayHabit.id,
				}
			});
		}
		else {
			await prisma.dayHabit.create({
				data: {
					day_id: day.id,
					habit_id: id,
				}
			});
		}
	});

	app.get('/summary', async () => {
		const summary = await prisma.$queryRaw`
			SELECT
				D.id,
				D.date,
				(
					SELECT 
						cast(count(*) as float)
					FROM day_habits DH
					WHERE DH.day_id = D.id
				) as completed,
				(
					SELECT 
						cast(count(*) as float)
					FROM habit_week_days HWD
					JOIN habits H
						ON H.id = HWD.habit_id
					WHERE 
						HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
						AND H.created_at <= D.date
				) as amount
			FROM days D
		`
		return {summary};
	});
}