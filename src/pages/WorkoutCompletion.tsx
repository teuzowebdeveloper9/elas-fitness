import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Camera, Star, Share2, Clock, TrendingUp, Check } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface WorkoutCompletionState {
  sessionId: string
  startTime: number
  exercisesCompleted: number
  totalExercises: number
}

export default function WorkoutCompletion() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const state = location.state as WorkoutCompletionState

  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [publishToFeed, setPublishToFeed] = useState(false)
  const [saving, setSaving] = useState(false)

  const durationMinutes = state?.startTime
    ? Math.round((Date.now() - state.startTime) / 1000 / 60)
    : 0

  useEffect(() => {
    if (!state?.sessionId) {
      navigate('/dashboard')
    }
  }, [state, navigate])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('workout-photos')
        .upload(fileName, photoFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('workout-photos')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      return null
    }
  }

  const handleFinish = async () => {
    if (rating === 0) {
      toast({
        title: 'Avalie seu treino',
        description: 'Por favor, dê uma nota para o seu treino antes de finalizar',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Upload da foto (se houver)
      const photoUrl = await uploadPhoto()

      // Atualizar sessão com foto, avaliação e feedback
      const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({
          photo_url: photoUrl,
          feedback_rating: rating,
          feedback_text: feedback,
          published_to_feed: publishToFeed
        })
        .eq('id', state.sessionId)

      if (updateError) throw updateError

      toast({
        title: 'Treino finalizado! 🎉',
        description: `Parabéns! Você treinou por ${durationMinutes} minutos.`
      })

      // Redirecionar para o dashboard ou feed (se publicou)
      if (publishToFeed) {
        navigate('/community')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao finalizar treino:', error)
      toast({
        title: 'Erro ao finalizar',
        description: 'Não foi possível salvar os dados do treino. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (!state?.sessionId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-20">
        {/* Header de conclusão */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Treino Concluído! 🎉</h1>
          <p className="text-muted-foreground">Parabéns por mais um treino completado</p>
        </div>

        {/* Estatísticas do treino */}
        <Card className="mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="w-8 h-8 mx-auto mb-2 text-[var(--lilac)] dark:text-purple-400" />
                <p className="text-2xl font-bold">{durationMinutes} min</p>
                <p className="text-sm text-muted-foreground">Duração</p>
              </div>
              <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-2xl font-bold">{state.exercisesCompleted}</p>
                <p className="text-sm text-muted-foreground">Exercícios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avaliação */}
        <Card className="mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Como foi seu treino?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estrelas de avaliação */}
            <div>
              <Label>Avalie de 1 a 5 estrelas</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback textual */}
            <div>
              <Label htmlFor="feedback">Comentários (opcional)</Label>
              <Textarea
                id="feedback"
                placeholder="Como você se sentiu? O que achou dos exercícios?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Foto e compartilhamento */}
        <Card className="mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Registre seu momento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview da foto */}
            {photoPreview && (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                  }}
                >
                  Remover
                </Button>
              </div>
            )}

            {/* Botão de adicionar foto */}
            {!photoPreview && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-input"
                />
                <Label
                  htmlFor="photo-input"
                  className="flex items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Camera className="w-6 h-6" />
                  <span>Tirar ou escolher foto</span>
                </Label>
              </div>
            )}

            {/* Opção de publicar no feed */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-[var(--lilac)] dark:text-purple-400" />
                <div>
                  <Label htmlFor="publish" className="cursor-pointer">
                    Publicar na comunidade
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe sua conquista com outras mulheres
                  </p>
                </div>
              </div>
              <Switch
                id="publish"
                checked={publishToFeed}
                onCheckedChange={setPublishToFeed}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de finalizar */}
        <Button
          onClick={handleFinish}
          disabled={saving || rating === 0}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {saving ? 'Salvando...' : 'Finalizar e Salvar'}
        </Button>
      </div>
    </div>
  )
}
