import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, ExternalLink } from 'lucide-react'
import { YouTubeVideo } from '@/lib/youtube-service'

interface ExerciseVideoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseName: string
  videos: YouTubeVideo[]
  loading: boolean
}

export function ExerciseVideoModal({
  open,
  onOpenChange,
  exerciseName,
  videos,
  loading
}: ExerciseVideoModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)

  // Resetar vídeo selecionado quando trocar de exercício ou receber novos vídeos
  useEffect(() => {
    if (videos.length > 0) {
      setSelectedVideo(videos[0])
    } else {
      setSelectedVideo(null)
    }
  }, [videos, exerciseName])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">
            Como executar: {exerciseName}
          </DialogTitle>
          <DialogDescription>
            Assista vídeos de demonstração para realizar o exercício corretamente
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/20 rounded-lg">
              <div className="text-center p-8">
                <div className="relative inline-block mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                  <Play className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Buscando os melhores vídeos...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Encontrando demonstrações de "{exerciseName}"
                </p>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center p-6">
                <p className="text-muted-foreground mb-4">
                  Não encontramos vídeos para este exercício no momento.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' exercício')}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Buscar no YouTube
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Player Principal */}
              {selectedVideo && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={selectedVideo.embedUrl}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Informações do vídeo selecionado */}
              {selectedVideo && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{selectedVideo.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedVideo.channelTitle}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.videoId}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir no YouTube
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de vídeos alternativos */}
              {videos.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Outros vídeos:</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2 pr-4">
                      {videos.slice(1).map((video) => (
                        <button
                          key={video.videoId}
                          onClick={() => setSelectedVideo(video)}
                          className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-24 h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">
                              {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {video.channelTitle}
                            </p>
                          </div>
                          <Play className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
