import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/contexts/UserContext'
import { Heart, MessageCircle, Share2, Users, Sparkles, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react'

interface Post {
  id: string
  author: string
  avatar: string
  time: string
  content: string
  likes: number
  comments: number
  tags: string[]
  liked?: boolean
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'Mariana Silva',
    avatar: 'MS',
    time: 'há 2 horas',
    content: 'Consegui treinar hoje mesmo cansada! Lembrei que pequenos passos também são progresso. Vocês me inspiram todos os dias! 💪',
    likes: 24,
    comments: 8,
    tags: ['motivação', 'constância'],
    liked: false
  },
  {
    id: '2',
    author: 'Ana Paula',
    avatar: 'AP',
    time: 'há 5 horas',
    content: 'Quem mais está enfrentando dificuldade em controlar a alimentação? Estou aprendendo a ser mais gentil comigo mesma e entender que cada dia é único.',
    likes: 42,
    comments: 15,
    tags: ['alimentação', 'autoestima'],
    liked: true
  },
  {
    id: '3',
    author: 'Juliana Costa',
    avatar: 'JC',
    time: 'há 1 dia',
    content: 'Celebrando 30 dias seguidos de treino! 🎉 Para quem achava que não conseguia começar, aqui está a prova de que é possível. Obrigada pelo apoio de todas!',
    likes: 89,
    comments: 23,
    tags: ['conquista', 'iniciante'],
    liked: true
  }
]

export default function Community() {
  const { userProfile } = useUser()
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [newPost, setNewPost] = useState('')
  const [activeTab, setActiveTab] = useState('feed')

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
        : post
    ))
  }

  const handlePost = () => {
    if (!newPost.trim()) return

    const post: Post = {
      id: Date.now().toString(),
      author: userProfile?.name || 'Você',
      avatar: userProfile?.name?.substring(0, 2).toUpperCase() || 'VC',
      time: 'agora',
      content: newPost,
      likes: 0,
      comments: 0,
      tags: [],
      liked: false
    }

    setPosts([post, ...posts])
    setNewPost('')
  }

  // Filtra conteúdo personalizado baseado nas dificuldades da usuária
  const getPersonalizedResources = () => {
    const challenges = userProfile?.challenges || []
    const resources: { title: string; description: string; icon: any; tag: string }[] = []

    if (challenges.includes('Falta de tempo para treinar')) {
      resources.push({
        title: 'Treinos Rápidos de 15min',
        description: 'Exercícios eficientes para encaixar na sua rotina',
        icon: TrendingUp,
        tag: 'tempo'
      })
    }

    if (challenges.includes('Dificuldade em manter a constância')) {
      resources.push({
        title: 'Estratégias de Consistência',
        description: 'Dicas para criar o hábito de treinar regularmente',
        icon: CheckCircle2,
        tag: 'constância'
      })
    }

    if (challenges.includes('Falta de motivação')) {
      resources.push({
        title: 'Comunidade de Apoio',
        description: 'Conecte-se com mulheres que passam pelo mesmo',
        icon: Users,
        tag: 'motivação'
      })
    }

    if (challenges.includes('Dificuldade em controlar a alimentação')) {
      resources.push({
        title: 'Guia de Alimentação Intuitiva',
        description: 'Aprenda a ter uma relação saudável com a comida',
        icon: BookOpen,
        tag: 'alimentação'
      })
    }

    if (challenges.includes('Ansiedade ou compulsão alimentar')) {
      resources.push({
        title: 'Técnicas de Mindfulness',
        description: 'Práticas para reduzir ansiedade e compulsão',
        icon: Sparkles,
        tag: 'ansiedade'
      })
    }

    if (challenges.includes('Pressão estética ou autoestima baixa')) {
      resources.push({
        title: 'Construindo Autoestima',
        description: 'Ame seu corpo em cada etapa da jornada',
        icon: Heart,
        tag: 'autoestima'
      })
    }

    return resources
  }

  const personalizedResources = getPersonalizedResources()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Comunidade Elas Fit</h1>
        <p className="text-pink-100">
          Um espaço seguro para compartilhar, apoiar e crescer juntas 💜
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="resources">Para Você</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          {/* Criar Post */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Textarea
                  placeholder="Compartilhe sua jornada, conquistas ou desafios..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handlePost}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={!newPost.trim()}
                >
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{post.author}</h3>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={post.liked ? 'text-pink-500' : ''}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recursos Personalizados Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card className="border-2 border-pink-200 dark:border-pink-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Conteúdo Personalizado Para Você
              </CardTitle>
              <CardDescription>
                Baseado nas dificuldades que você compartilhou conosco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {personalizedResources.length > 0 ? (
                personalizedResources.map((resource, index) => {
                  const Icon = resource.icon
                  return (
                    <div
                      key={index}
                      className="p-4 border-2 rounded-lg hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <Icon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {resource.tag}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Complete o questionário para receber conteúdo personalizado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recursos Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos da Comunidade</CardTitle>
              <CardDescription>Conteúdos para todas as mulheres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <h3 className="font-semibold mb-1">Histórias Inspiradoras</h3>
                <p className="text-sm text-muted-foreground">
                  Conheça a jornada de outras mulheres que transformaram suas vidas
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <h3 className="font-semibold mb-1">Biblioteca de Treinos</h3>
                <p className="text-sm text-muted-foreground">
                  Variações e adaptações para todos os níveis
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <h3 className="font-semibold mb-1">Receitas Saudáveis</h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhadas pela comunidade, testadas e aprovadas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grupos Tab */}
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grupos de Apoio</CardTitle>
              <CardDescription>Encontre seu grupo e conecte-se com mulheres que compartilham seus objetivos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 border-2 rounded-lg hover:border-pink-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Mães que Treinam</h3>
                  <Badge>328 membros</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Para mães que querem equilibrar maternidade e fitness
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Participar
                </Button>
              </div>

              <div className="p-4 border-2 rounded-lg hover:border-pink-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Começando do Zero</h3>
                  <Badge>512 membros</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Para quem está começando a jornada fitness agora
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Participar
                </Button>
              </div>

              <div className="p-4 border-2 rounded-lg hover:border-pink-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Menopausa Ativa</h3>
                  <Badge>245 membros</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Apoio e informação para mulheres em transição hormonal
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Participar
                </Button>
              </div>

              <div className="p-4 border-2 rounded-lg hover:border-pink-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Alimentação Consciente</h3>
                  <Badge>689 membros</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Dicas, receitas e apoio para uma relação saudável com a comida
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Participar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
