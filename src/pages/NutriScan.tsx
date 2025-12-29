import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Camera, Image as ImageIcon, Flame, Apple, Coffee, Target, Loader2, Check, X, Utensils } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { analyzeFoodImage } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

interface MealData {
  id: string
  meal_name: string
  meal_type: string
  calories: number
  protein: number
  carbs: number
  fats: number
  foods_detected: string[]
  date: string
  created_at: string
}

interface DailySummary {
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fats: number
  meals_count: number
}

export default function NutriScan() {
  const { userProfile } = useUser()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [todayMeals, setTodayMeals] = useState<MealData[]>([])
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    meals_count: 0
  })
  const [loadingMeals, setLoadingMeals] = useState(true)

  useEffect(() => {
    fetchTodayMeals()
  }, [])

  const fetchTodayMeals = async () => {
    try {
      setLoadingMeals(true)
      const today = format(new Date(), 'yyyy-MM-dd')

      // Buscar refeições de hoje
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (mealsError) throw mealsError

      setTodayMeals(meals || [])

      // Calcular resumo do dia
      if (meals && meals.length > 0) {
        const summary = meals.reduce((acc, meal) => ({
          total_calories: acc.total_calories + Number(meal.calories),
          total_protein: acc.total_protein + Number(meal.protein),
          total_carbs: acc.total_carbs + Number(meal.carbs),
          total_fats: acc.total_fats + Number(meal.fats),
          meals_count: acc.meals_count + 1
        }), {
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fats: 0,
          meals_count: 0
        })

        setDailySummary(summary)
      }
    } catch (error) {
      console.error('Erro ao buscar refeições:', error)
    } finally {
      setLoadingMeals(false)
    }
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraOpen(true)
      }
    } catch (error) {
      console.error('Erro ao abrir câmera:', error)
      toast({
        title: 'Erro ao abrir câmera',
        description: 'Não foi possível acessar a câmera. Tente fazer upload de uma imagem.',
        variant: 'destructive'
      })
    }
  }

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraOpen(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageData)
        closeCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeMeal = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)

    try {
      // Analisar imagem com IA
      const result = await analyzeFoodImage(capturedImage)
      setAnalysisResult(result)

      toast({
        title: '✅ Refeição analisada!',
        description: 'Confirme os dados e salve sua refeição.'
      })
    } catch (error) {
      console.error('Erro ao analisar refeição:', error)
      toast({
        title: 'Erro ao analisar',
        description: 'Não foi possível analisar a imagem. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveMeal = async () => {
    if (!analysisResult || !user) return

    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      // Buscar user_id do auth
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        throw new Error('Usuário não autenticado')
      }

      // Salvar refeição no banco
      const { error } = await supabase
        .from('meals')
        .insert({
          user_id: authUser.id,
          meal_name: analysisResult.meal_name,
          meal_type: analysisResult.meal_type,
          calories: analysisResult.nutrition.calories,
          protein: analysisResult.nutrition.protein,
          carbs: analysisResult.nutrition.carbs,
          fats: analysisResult.nutrition.fats,
          fiber: analysisResult.nutrition.fiber || 0,
          foods_detected: analysisResult.foods_detected,
          date: today
        })

      if (error) throw error

      // Atualizar resumo diário
      await fetchTodayMeals()

      // Limpar estado
      setCapturedImage(null)
      setAnalysisResult(null)

      toast({
        title: '🎉 Refeição salva!',
        description: 'Sua refeição foi registrada com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao salvar refeição:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a refeição. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const cancelAnalysis = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
  }

  const caloriesGoal = userProfile?.dailyCalories || 2000
  const proteinGoal = userProfile?.proteinGoal || 100
  const carbsGoal = userProfile?.carbsGoal || 200
  const fatsGoal = userProfile?.fatsGoal || 60

  const caloriesPercent = (dailySummary.total_calories / caloriesGoal) * 100
  const proteinPercent = (dailySummary.total_protein / proteinGoal) * 100
  const carbsPercent = (dailySummary.total_carbs / carbsGoal) * 100
  const fatsPercent = (dailySummary.total_fats / fatsGoal) * 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          Nutri Scan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tire foto da sua refeição e descubra os nutrientes
        </p>
      </div>

      {/* Resumo do Dia */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-orange-900/20 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Seu Consumo de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingMeals ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Flame className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{Math.round(dailySummary.total_calories)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">de {caloriesGoal} kcal</p>
                  <Progress value={caloriesPercent} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <Apple className="w-5 h-5 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold">{Math.round(dailySummary.total_protein)}g</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">de {proteinGoal}g</p>
                  <Progress value={proteinPercent} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <Coffee className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold">{Math.round(dailySummary.total_carbs)}g</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">de {carbsGoal}g</p>
                  <Progress value={carbsPercent} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <Target className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{Math.round(dailySummary.total_fats)}g</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">de {fatsGoal}g</p>
                  <Progress value={fatsPercent} className="mt-2 h-2" />
                </div>
              </div>

              {dailySummary.meals_count > 0 && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
                  <AlertDescription className="flex items-center justify-center gap-2">
                    <Utensils className="w-4 h-4" />
                    <strong>{dailySummary.meals_count}</strong> refeição{dailySummary.meals_count > 1 ? 'ões' : ''} registrada{dailySummary.meals_count > 1 ? 's' : ''} hoje
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Scanner de Refeição */}
      {!capturedImage && !isCameraOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Escanear Nova Refeição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={openCamera}
                className="h-32 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8" />
                  <span>Tirar Foto</span>
                </div>
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-32 border-2"
              >
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span>Escolher da Galeria</span>
                </div>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Câmera Aberta */}
      {isCameraOpen && (
        <Card>
          <CardContent className="p-4">
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                className="w-full h-auto"
                playsInline
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capturar
              </Button>
              <Button
                onClick={closeCamera}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imagem Capturada */}
      {capturedImage && !analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Imagem Capturada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={capturedImage}
              alt="Refeição"
              className="w-full h-auto rounded-lg"
            />
            <div className="flex gap-3">
              <Button
                onClick={analyzeMeal}
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 mr-2" />
                    Analisar Refeição
                  </>
                )}
              </Button>
              <Button
                onClick={cancelAnalysis}
                variant="outline"
                disabled={isAnalyzing}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da Análise */}
      {analysisResult && (
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Análise Concluída
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={capturedImage!}
              alt="Refeição"
              className="w-full h-auto rounded-lg"
            />

            <div>
              <h3 className="font-semibold text-lg mb-2">{analysisResult.meal_name}</h3>
              <Badge>{analysisResult.meal_type}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Flame className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{analysisResult.nutrition.calories}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Calorias</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Apple className="w-5 h-5 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold">{analysisResult.nutrition.protein}g</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Proteína</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Coffee className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold">{analysisResult.nutrition.carbs}g</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Carboidratos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{analysisResult.nutrition.fats}g</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Gorduras</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Alimentos Detectados:</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.foods_detected.map((food: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{food}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={saveMeal}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Salvar Refeição
              </Button>
              <Button
                onClick={cancelAnalysis}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refeições de Hoje */}
      {todayMeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Refeições de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayMeals.map((meal) => (
                <Card key={meal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{meal.meal_name}</h4>
                        <Badge variant="secondary" className="mt-1">{meal.meal_type}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">{Math.round(meal.calories)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">kcal</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                      <div className="text-center">
                        <p className="font-medium text-red-600">{Math.round(meal.protein)}g</p>
                        <p className="text-gray-500">Proteína</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-amber-600">{Math.round(meal.carbs)}g</p>
                        <p className="text-gray-500">Carbos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-blue-600">{Math.round(meal.fats)}g</p>
                        <p className="text-gray-500">Gorduras</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas escondido para captura de foto */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
