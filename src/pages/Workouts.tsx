import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Play, Clock, Flame, CheckCircle2, Target, Info, Heart } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { getWorkoutAdaptation, getLifePhaseLabel, getLifePhaseColor } from '@/utils/workoutAdaptations'

interface Exercise {
  name: string
  sets: string
  reps: string
  rest: string
  calories: number
  image?: string
}

interface Workout {
  id: string
  name: string
  duration: string
  level: string
  focus: string
  calories: number
  exercises: Exercise[]
}

export default function Workouts() {
  const { userProfile } = useUser()
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  const adaptation = userProfile
    ? getWorkoutAdaptation(userProfile.lifePhase, userProfile.fitnessLevel)
    : null

  const workouts: Workout[] = [
    {
      id: '1',
      name: 'Pernas & Glúteos',
      duration: '45 min',
      level: 'Intermediário',
      focus: 'Tonificação',
      calories: 350,
      exercises: [
        { name: 'Agachamento Sumô', sets: '4', reps: '12-15', rest: '60s', calories: 45 },
        { name: 'Afundo Alternado', sets: '3', reps: '10 cada', rest: '45s', calories: 40 },
        { name: 'Ponte de Glúteo', sets: '4', reps: '15', rest: '45s', calories: 35 },
        { name: 'Elevação Pélvica', sets: '3', reps: '12', rest: '60s', calories: 30 },
        { name: 'Cadeira Abdutora', sets: '3', reps: '15', rest: '45s', calories: 35 },
        { name: 'Stiff', sets: '4', reps: '12', rest: '60s', calories: 50 },
        { name: 'Panturrilha em Pé', sets: '3', reps: '20', rest: '30s', calories: 25 },
        { name: 'Glúteo no Cross', sets: '3', reps: '12 cada', rest: '45s', calories: 40 },
      ]
    },
    {
      id: '2',
      name: 'Corpo Superior',
      duration: '40 min',
      level: 'Iniciante',
      focus: 'Fortalecimento',
      calories: 280,
      exercises: [
        { name: 'Flexão de Braço', sets: '3', reps: '8-10', rest: '60s', calories: 35 },
        { name: 'Rosca Direta', sets: '3', reps: '12', rest: '45s', calories: 30 },
        { name: 'Tríceps no Banco', sets: '3', reps: '12', rest: '45s', calories: 30 },
        { name: 'Desenvolvimento de Ombros', sets: '3', reps: '10', rest: '60s', calories: 40 },
        { name: 'Remada Curvada', sets: '3', reps: '12', rest: '45s', calories: 45 },
        { name: 'Elevação Lateral', sets: '3', reps: '15', rest: '30s', calories: 25 },
        { name: 'Crucifixo', sets: '3', reps: '12', rest: '45s', calories: 35 },
      ]
    },
    {
      id: '3',
      name: 'Abdômen & Core',
      duration: '30 min',
      level: 'Todos',
      focus: 'Definição',
      calories: 220,
      exercises: [
        { name: 'Prancha Frontal', sets: '3', reps: '45s', rest: '30s', calories: 30 },
        { name: 'Abdominal Bicicleta', sets: '3', reps: '20', rest: '30s', calories: 35 },
        { name: 'Prancha Lateral', sets: '3', reps: '30s cada', rest: '30s', calories: 25 },
        { name: 'Mountain Climbers', sets: '3', reps: '20', rest: '45s', calories: 40 },
        { name: 'Tesoura', sets: '3', reps: '15', rest: '30s', calories: 30 },
        { name: 'Russian Twist', sets: '3', reps: '20', rest: '30s', calories: 35 },
        { name: 'V-Up', sets: '3', reps: '10', rest: '45s', calories: 25 },
      ]
    },
    {
      id: '4',
      name: 'Cardio HIIT',
      duration: '25 min',
      level: 'Avançado',
      focus: 'Queima de Gordura',
      calories: 400,
      exercises: [
        { name: 'Burpees', sets: '4', reps: '15', rest: '30s', calories: 60 },
        { name: 'Polichinelos', sets: '4', reps: '30', rest: '20s', calories: 50 },
        { name: 'High Knees', sets: '4', reps: '30s', rest: '20s', calories: 55 },
        { name: 'Jump Squats', sets: '4', reps: '15', rest: '30s', calories: 60 },
        { name: 'Mountain Climbers', sets: '4', reps: '30', rest: '20s', calories: 55 },
        { name: 'Skater Jumps', sets: '3', reps: '20', rest: '30s', calories: 50 },
        { name: 'Box Jumps', sets: '3', reps: '12', rest: '45s', calories: 70 },
      ]
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[var(--tiffany)] to-[var(--lilac)] bg-clip-text text-transparent">
          Meus Treinos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Treinos personalizados para sua fase da vida
        </p>
      </div>

      {/* Life Phase Info */}
      {userProfile && adaptation && (
        <Card className={`bg-gradient-to-r ${getLifePhaseColor(userProfile.lifePhase)} text-white border-0`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {getLifePhaseLabel(userProfile.lifePhase)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Recomendações para Você:
              </h4>
              <ul className="space-y-1 text-sm text-white/90">
                {adaptation.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
            {adaptation.warnings.length > 0 && (
              <Alert className="bg-white/10 border-white/20 text-white">
                <AlertDescription className="text-sm">
                  <strong>Atenção:</strong> {adaptation.warnings[0]}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="beginner">Iniciante</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediário</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onSelect={() => setSelectedWorkout(workout)}
            />
          ))}
        </TabsContent>

        <TabsContent value="beginner" className="space-y-4 mt-6">
          {workouts
            .filter((w) => w.level === 'Iniciante')
            .map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onSelect={() => setSelectedWorkout(workout)}
              />
            ))}
        </TabsContent>

        <TabsContent value="intermediate" className="space-y-4 mt-6">
          {workouts
            .filter((w) => w.level === 'Intermediário')
            .map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onSelect={() => setSelectedWorkout(workout)}
              />
            ))}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-6">
          {workouts
            .filter((w) => w.level === 'Avançado')
            .map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onSelect={() => setSelectedWorkout(workout)}
              />
            ))}
        </TabsContent>
      </Tabs>

      {selectedWorkout && (
        <WorkoutDetailDialog
          workout={selectedWorkout}
          open={!!selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </div>
  )
}

function WorkoutCard({ workout, onSelect }: { workout: Workout; onSelect: () => void }) {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{workout.name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{workout.level}</Badge>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                {workout.focus}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{workout.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">{workout.exercises.length} exercícios</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{workout.calories} kcal</span>
          </div>
        </div>
        <Button className="w-full bg-gradient-to-r from-[var(--tiffany)] to-[var(--lilac)] hover:from-pink-600 hover:to-purple-700">
          <Play className="w-4 h-4 mr-2" />
          Iniciar Treino
        </Button>
      </CardContent>
    </Card>
  )
}

function WorkoutDetailDialog({
  workout,
  open,
  onClose,
}: {
  workout: Workout
  open: boolean
  onClose: () => void
}) {
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())

  const toggleExercise = (index: number) => {
    const newCompleted = new Set(completedExercises)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedExercises(newCompleted)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{workout.name}</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{workout.level}</Badge>
            <Badge>{workout.focus}</Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-medium">{workout.duration}</p>
            <p className="text-xs text-gray-500">Duração</p>
          </div>
          <div className="text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-sm font-medium">{workout.exercises.length}</p>
            <p className="text-xs text-gray-500">Exercícios</p>
          </div>
          <div className="text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-sm font-medium">{workout.calories} kcal</p>
            <p className="text-xs text-gray-500">Estimado</p>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  completedExercises.has(index)
                    ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                    : ''
                }`}
                onClick={() => toggleExercise(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{index + 1}. {exercise.name}</span>
                        {completedExercises.has(index) && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p className="font-medium">Séries</p>
                          <p>{exercise.sets}</p>
                        </div>
                        <div>
                          <p className="font-medium">Repetições</p>
                          <p>{exercise.reps}</p>
                        </div>
                        <div>
                          <p className="font-medium">Descanso</p>
                          <p>{exercise.rest}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Flame className="w-4 h-4 text-orange-500 inline mr-1" />
                      <span className="text-sm font-medium">{exercise.calories} kcal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-[var(--tiffany)] to-[var(--lilac)] hover:from-pink-600 hover:to-purple-700"
            onClick={() => {
              alert('Treino iniciado! Boa sorte! 💪')
              setCompletedExercises(new Set())
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Começar Agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
