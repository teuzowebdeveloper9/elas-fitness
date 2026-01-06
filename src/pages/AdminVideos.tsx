import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Video, 
  Search,
  ExternalLink,
  Eye,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  ExerciseVideoFromDB,
  getAllVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  checkIsAdmin,
  extractYouTubeVideoId
} from '@/lib/video-database-service'

const MUSCLE_GROUPS = [
  { value: 'peito', label: 'Peito' },
  { value: 'costas', label: 'Costas' },
  { value: 'ombros', label: 'Ombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'pernas', label: 'Pernas' },
  { value: 'abdomen', label: 'Abdômen' },
  { value: 'gluteos', label: 'Glúteos' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mobilidade', label: 'Mobilidade' },
]

export default function AdminVideos() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<ExerciseVideoFromDB[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<string>('all')
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideoFromDB | null>(null)
  
  // New video form
  const [newExerciseName, setNewExerciseName] = useState('')
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('')
  const [newMuscleGroup, setNewMuscleGroup] = useState('')
  const [newChannelName, setNewChannelName] = useState('Queslo Sistemas')
  
  // Feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Preview do vídeo
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    setLoading(true)
    
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      navigate('/auth')
      return
    }
    
    const adminStatus = await checkIsAdmin()
    
    if (!adminStatus) {
      navigate('/')
      return
    }
    
    setIsAdmin(true)
    await loadVideos()
    setLoading(false)
  }

  async function loadVideos() {
    const allVideos = await getAllVideos()
    setVideos(allVideos)
  }

  async function handleAddVideo() {
    if (!newExerciseName.trim() || !newYoutubeUrl.trim()) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' })
      return
    }
    
    setSubmitting(true)
    setMessage(null)
    
    const result = await addVideo({
      exercise_name: newExerciseName,
      youtube_url_or_id: newYoutubeUrl,
      muscle_group: newMuscleGroup || undefined,
      channel_name: newChannelName || undefined
    })
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Vídeo adicionado com sucesso!' })
      setNewExerciseName('')
      setNewYoutubeUrl('')
      setNewMuscleGroup('')
      setNewChannelName('Queslo Sistemas')
      setIsAddDialogOpen(false)
      await loadVideos()
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao adicionar vídeo' })
    }
    
    setSubmitting(false)
  }

  async function handleUpdateVideo() {
    if (!selectedVideo) return
    
    setSubmitting(true)
    setMessage(null)
    
    const result = await updateVideo(selectedVideo.id, {
      exercise_name: newExerciseName,
      youtube_video_id: newYoutubeUrl,
      muscle_group: newMuscleGroup || null,
      channel_name: newChannelName
    })
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Vídeo atualizado com sucesso!' })
      setIsEditDialogOpen(false)
      setSelectedVideo(null)
      await loadVideos()
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao atualizar vídeo' })
    }
    
    setSubmitting(false)
  }

  async function handleDeleteVideo() {
    if (!selectedVideo) return
    
    setSubmitting(true)
    
    const result = await deleteVideo(selectedVideo.id)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Vídeo removido com sucesso!' })
      setIsDeleteDialogOpen(false)
      setSelectedVideo(null)
      await loadVideos()
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao remover vídeo' })
    }
    
    setSubmitting(false)
  }

  function openEditDialog(video: ExerciseVideoFromDB) {
    setSelectedVideo(video)
    setNewExerciseName(video.exercise_name)
    setNewYoutubeUrl(video.youtube_video_id)
    setNewMuscleGroup(video.muscle_group || '')
    setNewChannelName(video.channel_name)
    setIsEditDialogOpen(true)
  }

  function openDeleteDialog(video: ExerciseVideoFromDB) {
    setSelectedVideo(video)
    setIsDeleteDialogOpen(true)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  // Filtrar vídeos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.exercise_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMuscle = filterMuscle === 'all' || video.muscle_group === filterMuscle
    return matchesSearch && matchesMuscle
  })

  // Atualizar preview quando URL muda
  useEffect(() => {
    if (newYoutubeUrl) {
      const videoId = extractYouTubeVideoId(newYoutubeUrl)
      if (videoId && videoId.length === 11) {
        setPreviewVideoId(videoId)
      } else {
        setPreviewVideoId(null)
      }
    } else {
      setPreviewVideoId(null)
    }
  }, [newYoutubeUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-800/50 border-red-500/50">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
            <p className="text-slate-400">Você não tem permissão para acessar esta área.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Admin</h1>
              <p className="text-sm text-slate-400">Gerenciamento de Vídeos</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Feedback Message */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Video className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{videos.length}</p>
                  <p className="text-sm text-slate-400">Total de Vídeos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Eye className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {videos.filter(v => v.is_active).length}
                  </p>
                  <p className="text-sm text-slate-400">Vídeos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(videos.map(v => v.muscle_group).filter(Boolean)).size}
                  </p>
                  <p className="text-sm text-slate-400">Grupos Musculares</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="bg-slate-800/50 border-purple-500/30 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar exercício..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              {/* Filter */}
              <Select value={filterMuscle} onValueChange={setFilterMuscle}>
                <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Filtrar por grupo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">Todos os grupos</SelectItem>
                  {MUSCLE_GROUPS.map(group => (
                    <SelectItem key={group.value} value={group.value} className="text-white hover:bg-slate-700">
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Add Button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vídeo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-purple-500/30 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-purple-400" />
                      Adicionar Novo Vídeo
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Cole o link do YouTube ou apenas o ID do vídeo
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label className="text-slate-300">Nome do Exercício *</Label>
                      <Input
                        placeholder="Ex: Supino reto com barra"
                        value={newExerciseName}
                        onChange={(e) => setNewExerciseName(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-slate-300">Link ou ID do YouTube *</Label>
                      <Input
                        placeholder="https://youtube.com/watch?v=xxx ou apenas o ID"
                        value={newYoutubeUrl}
                        onChange={(e) => setNewYoutubeUrl(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Aceita: youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/shorts/xxx ou só o ID
                      </p>
                    </div>
                    
                    {/* Preview do vídeo */}
                    {previewVideoId && (
                      <div className="rounded-lg overflow-hidden bg-slate-900">
                        <iframe
                          src={`https://www.youtube.com/embed/${previewVideoId}`}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Grupo Muscular</Label>
                        <Select value={newMuscleGroup} onValueChange={setNewMuscleGroup}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {MUSCLE_GROUPS.map(group => (
                              <SelectItem key={group.value} value={group.value} className="text-white hover:bg-slate-700">
                                {group.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">Canal</Label>
                        <Input
                          placeholder="Nome do canal"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAddVideo} 
                      disabled={submitting}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Videos List */}
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Vídeos Cadastrados</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredVideos.length} vídeo(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredVideos.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum vídeo encontrado</p>
                </div>
              ) : (
                filteredVideos.map(video => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-purple-500/30 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                      <img
                        src={video.thumbnail_url}
                        alt={video.exercise_name}
                        className="w-full h-full object-cover"
                      />
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-6 h-6 text-white" />
                      </a>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{video.exercise_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                          {video.muscle_group || 'Sem grupo'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {video.channel_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        ID: {video.youtube_video_id}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(video)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(video)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-purple-400" />
              Editar Vídeo
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-slate-300">Nome do Exercício</Label>
              <Input
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">ID do YouTube</Label>
              <Input
                value={newYoutubeUrl}
                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white mt-1"
              />
            </div>
            
            {previewVideoId && (
              <div className="rounded-lg overflow-hidden bg-slate-900">
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideoId}`}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Grupo Muscular</Label>
                <Select value={newMuscleGroup} onValueChange={setNewMuscleGroup}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {MUSCLE_GROUPS.map(group => (
                      <SelectItem key={group.value} value={group.value} className="text-white hover:bg-slate-700">
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-slate-300">Canal</Label>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white mt-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateVideo}
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-red-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja remover o vídeo "{selectedVideo?.exercise_name}"?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteVideo}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



