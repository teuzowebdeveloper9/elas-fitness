import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Camera, Image as ImageIcon, Flame, Apple, Coffee, Loader2, ArrowLeft } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { analyzeFoodImage } from '@/lib/openai-real'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { FoxMascot } from '@/components/mascot/fox-mascot'
import { useNavigate } from 'react-router-dom'

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

export default function NutriScanRedesign() {
  const { userProfile } = useUser()
  const { toast } = useToast()
  const navigate = useNavigate()
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

      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (mealsError) throw mealsError

      setTodayMeals(meals || [])

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
        setIsCameraOpen(true)
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      toast({
        title: 'Erro ao abrir câmera',
        description: 'Verifique as permissões do navegador.',
        variant: 'destructive'
      })
    }
  }

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    closeCamera()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)

    try {
      const result = await analyzeFoodImage(capturedImage)
      setAnalysisResult(result)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = format(new Date(), 'yyyy-MM-dd')

      const { error: insertError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          meal_name: result.meal_name,
          meal_type: result.meal_type,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fats: result.fats,
          foods_detected: result.foods_detected,
          date: today
        })

      if (insertError) throw insertError

      await fetchTodayMeals()

      toast({
        title: 'Refeição analisada! ✨',
        description: 'Os dados foram salvos automaticamente.'
      })
    } catch (error) {
      console.error('Erro ao analisar imagem:', error)
      toast({
        title: 'Erro na análise',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetScan = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
  }

  const calorieGoal = userProfile?.dailyCalories || 2000
  const calorieProgress = (dailySummary.total_calories / calorieGoal) * 100

  return (
    <div className="space-y-6">
      {/* Header com voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/diet')}
          className="rounded-full hover:bg-[var(--tiffany-light)]"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--tiffany)]" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-heading text-[rgb(51,51,51)]">Nutri Scan</h1>
          <p className="text-sm text-[var(--warm-gray)]">Analise sua refeição com IA</p>
        </div>
        <FoxMascot stage="progressing" size="small" />
      </div>

      {/* Resumo do dia */}
      {!loadingMeals && dailySummary.meals_count > 0 && (
        <Card className="border-2 border-[var(--tiffany)] shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Flame className="w-5 h-5 text-[var(--coral)]" />
              Seu dia hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Calorias</span>
                <span className="text-sm text-[var(--warm-gray)]">
                  {Math.round(dailySummary.total_calories)} / {calorieGoal}
                </span>
              </div>
              <Progress value={calorieProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-[rgb(220,245,243)] to-white p-3 rounded-2xl border border-[var(--warm-gray-light)] text-center">
                <p className="text-lg font-bold text-[rgb(51,51,51)]">{Math.round(dailySummary.total_protein)}g</p>
                <p className="text-xs text-[var(--warm-gray)]">Proteínas</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(255,250,235)] to-white p-3 rounded-2xl border border-[var(--warm-gray-light)] text-center">
                <p className="text-lg font-bold text-[rgb(51,51,51)]">{Math.round(dailySummary.total_carbs)}g</p>
                <p className="text-xs text-[var(--warm-gray)]">Carboidratos</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(255,245,240)] to-white p-3 rounded-2xl border border-[var(--warm-gray-light)] text-center">
                <p className="text-lg font-bold text-[rgb(51,51,51)]">{Math.round(dailySummary.total_fats)}g</p>
                <p className="text-xs text-[var(--warm-gray)]">Gorduras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Captura de imagem */}
      {!capturedImage && !isCameraOpen && (
        <Card className="border-2 border-[var(--coral)] shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-[var(--coral)] bg-opacity-10 rounded-3xl mb-4">
                <Camera className="w-12 h-12 text-[var(--coral)]" />
              </div>
              <h3 className="font-heading text-lg text-[rgb(51,51,51)] mb-2">
                Capture ou envie uma foto
              </h3>
              <p className="text-sm text-[var(--warm-gray)]">
                Vou identificar os alimentos e calcular as calorias
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={openCamera}
                className="w-full bg-[var(--coral)] hover:bg-[rgb(255,139,128)] text-white font-heading-medium py-6 rounded-2xl"
              >
                <Camera className="w-5 h-5 mr-2" />
                Câmera
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full border-2 border-[var(--coral)] text-[var(--coral)] hover:bg-[var(--coral)] hover:text-white font-heading-medium py-6 rounded-2xl"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Galeria
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Câmera ativa */}
      {isCameraOpen && (
        <Card className="border-2 border-[var(--tiffany)] shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-t-2xl"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="bg-[var(--coral)] hover:bg-[rgb(255,139,128)] text-white rounded-full w-16 h-16 shadow-lg"
                >
                  <Camera className="w-6 h-6" />
                </Button>
                <Button
                  onClick={closeCamera}
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-gray-100 rounded-full w-16 h-16 shadow-lg"
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imagem capturada - antes de analisar */}
      {capturedImage && !analysisResult && (
        <Card className="border-2 border-[var(--tiffany)] shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <img
              src={capturedImage}
              alt="Refeição capturada"
              className="w-full rounded-2xl"
            />

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-[var(--tiffany)] hover:bg-[var(--tiffany-dark)] text-white font-heading-medium py-6 rounded-2xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Analisar refeição'
                )}
              </Button>

              <Button
                onClick={resetScan}
                variant="outline"
                disabled={isAnalyzing}
                className="w-full border-2 border-[var(--warm-gray-light)] text-[var(--warm-gray)] hover:bg-[var(--warm-gray-light)] font-heading-medium py-6 rounded-2xl"
              >
                Nova foto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da análise */}
      {analysisResult && (
        <Card className="border-2 border-[var(--tiffany)] shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Apple className="w-5 h-5 text-[var(--tiffany)]" />
              {analysisResult.meal_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Refeição analisada"
                className="w-full rounded-2xl"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[rgb(255,240,235)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center">
                <p className="text-2xl font-bold text-[rgb(51,51,51)]">{analysisResult.calories}</p>
                <p className="text-xs text-[var(--warm-gray)]">Calorias</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(220,245,243)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center">
                <p className="text-2xl font-bold text-[rgb(51,51,51)]">{analysisResult.protein}g</p>
                <p className="text-xs text-[var(--warm-gray)]">Proteínas</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(255,250,235)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center">
                <p className="text-2xl font-bold text-[rgb(51,51,51)]">{analysisResult.carbs}g</p>
                <p className="text-xs text-[var(--warm-gray)]">Carboidratos</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(255,245,240)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center">
                <p className="text-2xl font-bold text-[rgb(51,51,51)]">{analysisResult.fats}g</p>
                <p className="text-xs text-[var(--warm-gray)]">Gorduras</p>
              </div>
            </div>

            {analysisResult.foods_detected && analysisResult.foods_detected.length > 0 && (
              <div className="bg-[var(--tiffany-light)] p-4 rounded-2xl">
                <h4 className="font-heading-medium text-sm text-[rgb(51,51,51)] mb-2">
                  Alimentos detectados:
                </h4>
                <ul className="space-y-1">
                  {analysisResult.foods_detected.map((food: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-[var(--tiffany)]">•</span>
                      <span className="text-[rgb(51,51,51)]">{food}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={resetScan}
              className="w-full bg-[var(--coral)] hover:bg-[rgb(255,139,128)] text-white font-heading-medium py-6 rounded-2xl"
            >
              Escanear outra refeição
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Histórico de refeições */}
      {todayMeals.length > 0 && (
        <Card className="border-2 border-[var(--lilac-light)] shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[var(--lilac)]" />
              Refeições de hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white border border-[var(--warm-gray-light)] rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading-medium text-[rgb(51,51,51)]">{meal.meal_name}</h4>
                  <Badge className="bg-[var(--lilac-light)] text-[var(--lilac)] font-heading-medium">
                    {meal.meal_type}
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-[var(--warm-gray)]">
                  <span>{meal.calories} cal</span>
                  <span>{meal.protein}g prot</span>
                  <span>{meal.carbs}g carb</span>
                  <span>{meal.fats}g gord</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
