import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Camera, Image as ImageIcon, Flame, Apple, Coffee, ArrowLeft, AlertTriangle, Sparkles } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { analyzeFoodImage } from '@/lib/openai-real'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { FoxMascot } from '@/components/mascot/fox-mascot'
import { useNavigate } from 'react-router-dom'

// Frases do loading animado
const LOADING_PHRASES = [
  { emoji: '👀', text: 'Olhando para sua refeição...', duration: 1500 },
  { emoji: '🔍', text: 'Identificando os alimentos...', duration: 2000 },
  { emoji: '🥗', text: 'Analisando vegetais e proteínas...', duration: 1800 },
  { emoji: '⚖️', text: 'Estimando as porções...', duration: 1500 },
  { emoji: '🧮', text: 'Calculando calorias...', duration: 1700 },
  { emoji: '💪', text: 'Contando as proteínas...', duration: 1500 },
  { emoji: '🍞', text: 'Medindo carboidratos...', duration: 1400 },
  { emoji: '🥑', text: 'Verificando gorduras boas...', duration: 1600 },
  { emoji: '✨', text: 'Finalizando análise...', duration: 2000 },
]

// Componente de Loading Animado
function AnalyzingLoader({ image }: { image: string }) {
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let totalTime = 0
    const timers: NodeJS.Timeout[] = []
    
    LOADING_PHRASES.forEach((phrase, index) => {
      const timer = setTimeout(() => {
        setCurrentPhrase(index)
        setProgress(((index + 1) / LOADING_PHRASES.length) * 100)
      }, totalTime)
      timers.push(timer)
      totalTime += phrase.duration
    })

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + 0.5
      })
    }, 100)

    return () => {
      timers.forEach(t => clearTimeout(t))
      clearInterval(progressInterval)
    }
  }, [])

  const phrase = LOADING_PHRASES[currentPhrase]

  return (
    <Card className="border-2 border-[var(--tiffany)] shadow-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Imagem com overlay */}
        <div className="relative">
          <img 
            src={image} 
            alt="Analisando" 
            className="w-full h-48 object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Scan animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--tiffany)] to-transparent animate-pulse"
              style={{ 
                top: `${(currentPhrase / LOADING_PHRASES.length) * 100}%`,
                boxShadow: '0 0 20px var(--tiffany), 0 0 40px var(--tiffany)'
              }}
            />
          </div>
          
          {/* Central loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl text-center min-w-[280px]">
              <div className="relative">
                <div className="text-5xl mb-3 animate-bounce">{phrase.emoji}</div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-lg font-heading text-[rgb(51,51,51)] mb-4">
                {phrase.text}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--tiffany)] to-[var(--coral)] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--warm-gray)] mt-2">
                {Math.round(progress)}% concluído
              </p>
            </div>
          </div>
        </div>
        
        {/* Steps indicator */}
        <div className="p-4 bg-gradient-to-r from-[var(--tiffany-light)] to-white">
          <div className="flex justify-center gap-1">
            {LOADING_PHRASES.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentPhrase 
                    ? 'bg-[var(--tiffany)] scale-110' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de "Não é Comida"
function NotFoodResult({ 
  detectedContent, 
  funnyMessage, 
  onReset 
}: { 
  detectedContent: string
  funnyMessage: string
  onReset: () => void 
}) {
  const funnyEmojis = ['🤔', '😅', '🙈', '😂', '🤷‍♀️', '👀']
  const randomEmoji = funnyEmojis[Math.floor(Math.random() * funnyEmojis.length)]

  return (
    <Card className="border-2 border-[var(--coral)] shadow-xl overflow-hidden">
      <CardContent className="pt-6 space-y-6">
        {/* Ilustração divertida */}
        <div className="text-center py-6">
          <div className="relative inline-block">
            <div className="text-8xl animate-bounce">{randomEmoji}</div>
            <AlertTriangle className="absolute -bottom-2 -right-2 w-10 h-10 text-[var(--coral)] animate-pulse" />
          </div>
        </div>

        {/* Mensagem principal */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-heading text-[var(--coral)]">
            Opa! Isso não é comida!
          </h3>
          <p className="text-lg text-[rgb(51,51,51)]">
            {funnyMessage}
          </p>
          <div className="bg-[var(--coral)]/10 rounded-2xl p-4">
            <p className="text-sm text-[var(--warm-gray)]">
              <span className="font-medium">Detectei:</span> {detectedContent}
            </p>
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-gradient-to-br from-[var(--tiffany-light)] to-white rounded-2xl p-4 space-y-2">
          <h4 className="font-heading-medium text-sm text-[var(--tiffany)]">
            💡 Dicas para uma boa foto:
          </h4>
          <ul className="text-sm text-[var(--warm-gray)] space-y-1">
            <li>📸 Fotografe seu prato de cima</li>
            <li>💡 Use boa iluminação</li>
            <li>🍽️ Inclua todo o prato na foto</li>
            <li>🎯 Foque nos alimentos</li>
          </ul>
        </div>

        {/* Botão de tentar novamente */}
        <Button
          onClick={onReset}
          className="w-full bg-[var(--coral)] hover:bg-[rgb(255,139,128)] text-white font-heading-medium py-6 rounded-2xl text-lg"
        >
          <Camera className="w-5 h-5 mr-2" />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

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
  const [notFoodResult, setNotFoodResult] = useState<{ detectedContent: string; funnyMessage: string } | null>(null)
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
      // Primeiro abre o estado para renderizar o video element
      setIsCameraOpen(true)
      
      // Aguarda o DOM atualizar
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        console.log('📸 Câmera aberta com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      setIsCameraOpen(false)
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
    setNotFoodResult(null)

    try {
      const result = await analyzeFoodImage(capturedImage)
      
      // Verificar se não é comida
      if (result.is_food === false) {
        setNotFoodResult({
          detectedContent: result.detected_content,
          funnyMessage: result.funny_message
        })
        setIsAnalyzing(false)
        return
      }

      setAnalysisResult(result)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = format(new Date(), 'yyyy-MM-dd')

      // Extrair valores nutrition
      const nutrition = result.nutrition || {}
      
      const { error: insertError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          meal_name: result.meal_name,
          meal_type: result.meal_type,
          calories: nutrition.calories || result.calories,
          protein: nutrition.protein || result.protein,
          carbs: nutrition.carbs || result.carbs,
          fats: nutrition.fats || result.fats,
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
    setNotFoodResult(null)
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
            <div className="relative bg-black aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-t-2xl"
              />
              {/* Guia de enquadramento */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/40 rounded-xl" />
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
                  <p className="text-white text-sm font-medium">📸 Enquadre sua refeição</p>
                </div>
              </div>
              {/* Botões */}
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

      {/* Loading animado durante análise */}
      {isAnalyzing && capturedImage && (
        <AnalyzingLoader image={capturedImage} />
      )}

      {/* Resultado: Não é comida */}
      {notFoodResult && !isAnalyzing && (
        <NotFoodResult 
          detectedContent={notFoodResult.detectedContent}
          funnyMessage={notFoodResult.funnyMessage}
          onReset={resetScan}
        />
      )}

      {/* Imagem capturada - antes de analisar */}
      {capturedImage && !analysisResult && !isAnalyzing && !notFoodResult && (
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
                <Sparkles className="w-5 h-5 mr-2" />
                Analisar refeição
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
      {analysisResult && analysisResult.is_food !== false && (
        <Card className="border-2 border-[var(--tiffany)] shadow-lg overflow-hidden">
          {/* Header com sucesso */}
          <div className="bg-gradient-to-r from-[var(--tiffany)] to-[var(--tiffany-dark)] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Apple className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg">{analysisResult.meal_name}</h3>
                <p className="text-sm opacity-90">Análise concluída com sucesso! ✨</p>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-4 space-y-4">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Refeição analisada"
                className="w-full rounded-2xl"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[rgb(255,240,235)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center transform hover:scale-105 transition-transform">
                <p className="text-3xl font-bold text-[var(--coral)]">
                  {analysisResult.nutrition?.calories || analysisResult.calories}
                </p>
                <p className="text-xs text-[var(--warm-gray)] font-medium">Calorias</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(220,245,243)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center transform hover:scale-105 transition-transform">
                <p className="text-3xl font-bold text-[var(--tiffany)]">
                  {analysisResult.nutrition?.protein || analysisResult.protein}g
                </p>
                <p className="text-xs text-[var(--warm-gray)] font-medium">Proteínas</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(255,250,235)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center transform hover:scale-105 transition-transform">
                <p className="text-3xl font-bold text-yellow-600">
                  {analysisResult.nutrition?.carbs || analysisResult.carbs}g
                </p>
                <p className="text-xs text-[var(--warm-gray)] font-medium">Carboidratos</p>
              </div>
              <div className="bg-gradient-to-br from-[rgb(255,245,240)] to-white p-4 rounded-2xl border border-[var(--warm-gray-light)] text-center transform hover:scale-105 transition-transform">
                <p className="text-3xl font-bold text-orange-500">
                  {analysisResult.nutrition?.fats || analysisResult.fats}g
                </p>
                <p className="text-xs text-[var(--warm-gray)] font-medium">Gorduras</p>
              </div>
            </div>

            {analysisResult.foods_detected && analysisResult.foods_detected.length > 0 && (
              <div className="bg-gradient-to-br from-[var(--tiffany-light)] to-white p-4 rounded-2xl">
                <h4 className="font-heading-medium text-sm text-[var(--tiffany)] mb-3 flex items-center gap-2">
                  <span>🍽️</span> Alimentos detectados:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.foods_detected.map((food: string, i: number) => (
                    <Badge 
                      key={i} 
                      className="bg-white border border-[var(--tiffany)] text-[rgb(51,51,51)] hover:bg-[var(--tiffany-light)]"
                    >
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={resetScan}
              className="w-full bg-gradient-to-r from-[var(--coral)] to-[rgb(255,139,128)] hover:from-[rgb(255,139,128)] hover:to-[var(--coral)] text-white font-heading-medium py-6 rounded-2xl text-lg shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
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
