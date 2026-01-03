import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Ruler, TrendingDown, TrendingUp, Plus, Calendar,
  Scale, Activity, Eye, Trash2, Edit
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BodyMeasurement {
  id: string
  measured_at: string
  weight?: number
  height?: number
  neck?: number
  shoulders?: number
  chest?: number
  waist?: number
  abdomen?: number
  hips?: number
  thigh_right?: number
  thigh_left?: number
  calf_right?: number
  calf_left?: number
  arm_right?: number
  arm_left?: number
  forearm_right?: number
  forearm_left?: number
  body_fat_percentage?: number
  muscle_mass?: number
  notes?: string
  photo_url?: string
}

export default function BodyMeasurements() {
  const { toast } = useToast()
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState<BodyMeasurement | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    measured_at: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    neck: '',
    shoulders: '',
    chest: '',
    waist: '',
    abdomen: '',
    hips: '',
    thigh_right: '',
    thigh_left: '',
    calf_right: '',
    calf_left: '',
    arm_right: '',
    arm_left: '',
    forearm_right: '',
    forearm_left: '',
    body_fat_percentage: '',
    muscle_mass: '',
    notes: ''
  })

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const fetchMeasurements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })

      if (error) throw error

      setMeasurements(data || [])
    } catch (error) {
      console.error('Erro ao buscar medidas:', error)
      toast({
        title: 'Erro ao carregar medidas',
        description: 'Não foi possível carregar seu histórico.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logada.',
          variant: 'destructive'
        })
        return
      }

      // Converter strings vazias para null
      const cleanData: any = {
        user_id: user.id,
        measured_at: new Date(formData.measured_at).toISOString()
      }

      Object.keys(formData).forEach((key) => {
        if (key !== 'measured_at' && key !== 'notes') {
          const value = formData[key as keyof typeof formData]
          cleanData[key] = value ? parseFloat(value as string) : null
        } else if (key === 'notes') {
          cleanData[key] = formData.notes || null
        }
      })

      if (selectedMeasurement) {
        // Atualizar
        const { error } = await supabase
          .from('body_measurements')
          .update(cleanData)
          .eq('id', selectedMeasurement.id)

        if (error) throw error

        toast({
          title: '✅ Medidas atualizadas!',
          description: 'Seu registro foi atualizado com sucesso.'
        })
      } else {
        // Inserir novo
        const { error } = await supabase
          .from('body_measurements')
          .insert(cleanData)

        if (error) throw error

        toast({
          title: '✅ Medidas salvas!',
          description: 'Seu novo registro foi adicionado ao histórico.'
        })
      }

      setDialogOpen(false)
      resetForm()
      fetchMeasurements()
    } catch (error) {
      console.error('Erro ao salvar medidas:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas medidas.',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return

    try {
      const { error } = await supabase
        .from('body_measurements')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Registro excluído',
        description: 'A medida foi removida do histórico.'
      })

      fetchMeasurements()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o registro.',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (measurement: BodyMeasurement) => {
    setSelectedMeasurement(measurement)
    setFormData({
      measured_at: measurement.measured_at.split('T')[0],
      weight: measurement.weight?.toString() || '',
      height: measurement.height?.toString() || '',
      neck: measurement.neck?.toString() || '',
      shoulders: measurement.shoulders?.toString() || '',
      chest: measurement.chest?.toString() || '',
      waist: measurement.waist?.toString() || '',
      abdomen: measurement.abdomen?.toString() || '',
      hips: measurement.hips?.toString() || '',
      thigh_right: measurement.thigh_right?.toString() || '',
      thigh_left: measurement.thigh_left?.toString() || '',
      calf_right: measurement.calf_right?.toString() || '',
      calf_left: measurement.calf_left?.toString() || '',
      arm_right: measurement.arm_right?.toString() || '',
      arm_left: measurement.arm_left?.toString() || '',
      forearm_right: measurement.forearm_right?.toString() || '',
      forearm_left: measurement.forearm_left?.toString() || '',
      body_fat_percentage: measurement.body_fat_percentage?.toString() || '',
      muscle_mass: measurement.muscle_mass?.toString() || '',
      notes: measurement.notes || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedMeasurement(null)
    setFormData({
      measured_at: new Date().toISOString().split('T')[0],
      weight: '',
      height: '',
      neck: '',
      shoulders: '',
      chest: '',
      waist: '',
      abdomen: '',
      hips: '',
      thigh_right: '',
      thigh_left: '',
      calf_right: '',
      calf_left: '',
      arm_right: '',
      arm_left: '',
      forearm_right: '',
      forearm_left: '',
      body_fat_percentage: '',
      muscle_mass: '',
      notes: ''
    })
  }

  const calculateDifference = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return null
    const diff = current - previous
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
      isNegative: diff < 0
    }
  }

  const latestMeasurement = measurements[0]
  const previousMeasurement = measurements[1]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[rgb(176,235,229)] via-white to-[rgb(216,191,228)] rounded-3xl p-6 shadow-xl border border-[rgb(231,228,225)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-heading text-[rgb(51,51,51)]">
              Histórico de Medidas
            </h2>
            <p className="text-sm text-[var(--warm-gray)] mt-1">
              Acompanhe sua evolução corporal ao longo do tempo
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--coral)] hover:bg-[rgb(255,139,128)]">
                <Plus className="w-4 h-4 mr-2" />
                Nova Medida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedMeasurement ? 'Editar Medidas' : 'Adicionar Novas Medidas'}
                </DialogTitle>
                <DialogDescription>
                  Preencha apenas os campos que você mediu. Não é necessário preencher todos.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Data */}
                <div>
                  <Label htmlFor="measured_at">Data da Medição</Label>
                  <Input
                    id="measured_at"
                    type="date"
                    value={formData.measured_at}
                    onChange={(e) => setFormData({ ...formData, measured_at: e.target.value })}
                    required
                  />
                </div>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="body">Corpo</TabsTrigger>
                    <TabsTrigger value="limbs">Membros</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 65.5"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Altura (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 165"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="body_fat_percentage">% Gordura Corporal</Label>
                        <Input
                          id="body_fat_percentage"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 25.5"
                          value={formData.body_fat_percentage}
                          onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="muscle_mass">Massa Muscular (kg)</Label>
                        <Input
                          id="muscle_mass"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 45.2"
                          value={formData.muscle_mass}
                          onChange={(e) => setFormData({ ...formData, muscle_mass: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="body" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="neck">Pescoço (cm)</Label>
                        <Input
                          id="neck"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 32"
                          value={formData.neck}
                          onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulders">Ombros (cm)</Label>
                        <Input
                          id="shoulders"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 98"
                          value={formData.shoulders}
                          onChange={(e) => setFormData({ ...formData, shoulders: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chest">Busto (cm)</Label>
                        <Input
                          id="chest"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 90"
                          value={formData.chest}
                          onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="waist">Cintura (cm)</Label>
                        <Input
                          id="waist"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 70"
                          value={formData.waist}
                          onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="abdomen">Abdômen (cm)</Label>
                        <Input
                          id="abdomen"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 75"
                          value={formData.abdomen}
                          onChange={(e) => setFormData({ ...formData, abdomen: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hips">Quadril (cm)</Label>
                        <Input
                          id="hips"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 95"
                          value={formData.hips}
                          onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="limbs" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="arm_right">Braço Direito (cm)</Label>
                        <Input
                          id="arm_right"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 28"
                          value={formData.arm_right}
                          onChange={(e) => setFormData({ ...formData, arm_right: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="arm_left">Braço Esquerdo (cm)</Label>
                        <Input
                          id="arm_left"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 28"
                          value={formData.arm_left}
                          onChange={(e) => setFormData({ ...formData, arm_left: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="forearm_right">Antebraço Direito (cm)</Label>
                        <Input
                          id="forearm_right"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 23"
                          value={formData.forearm_right}
                          onChange={(e) => setFormData({ ...formData, forearm_right: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="forearm_left">Antebraço Esquerdo (cm)</Label>
                        <Input
                          id="forearm_left"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 23"
                          value={formData.forearm_left}
                          onChange={(e) => setFormData({ ...formData, forearm_left: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="thigh_right">Coxa Direita (cm)</Label>
                        <Input
                          id="thigh_right"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 55"
                          value={formData.thigh_right}
                          onChange={(e) => setFormData({ ...formData, thigh_right: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="thigh_left">Coxa Esquerda (cm)</Label>
                        <Input
                          id="thigh_left"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 55"
                          value={formData.thigh_left}
                          onChange={(e) => setFormData({ ...formData, thigh_left: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="calf_right">Panturrilha Direita (cm)</Label>
                        <Input
                          id="calf_right"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 36"
                          value={formData.calf_right}
                          onChange={(e) => setFormData({ ...formData, calf_right: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="calf_left">Panturrilha Esquerda (cm)</Label>
                        <Input
                          id="calf_left"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 36"
                          value={formData.calf_left}
                          onChange={(e) => setFormData({ ...formData, calf_left: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Observações */}
                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Como você está se sentindo? Alguma mudança na rotina?"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-[var(--coral)] hover:bg-[rgb(255,139,128)]">
                    {selectedMeasurement ? 'Atualizar' : 'Salvar'} Medidas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo Atual vs Anterior */}
      {latestMeasurement && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Peso Atual</p>
                  <p className="text-2xl font-bold">{latestMeasurement.weight ? `${latestMeasurement.weight} kg` : '-'}</p>
                  {previousMeasurement?.weight && latestMeasurement.weight && (
                    <div className="flex items-center gap-1 mt-1">
                      {latestMeasurement.weight < previousMeasurement.weight ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-xs">
                        {Math.abs(latestMeasurement.weight - previousMeasurement.weight).toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
                <Scale className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cintura</p>
                  <p className="text-2xl font-bold">{latestMeasurement.waist ? `${latestMeasurement.waist} cm` : '-'}</p>
                  {previousMeasurement?.waist && latestMeasurement.waist && (
                    <div className="flex items-center gap-1 mt-1">
                      {latestMeasurement.waist < previousMeasurement.waist ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-xs">
                        {Math.abs(latestMeasurement.waist - previousMeasurement.waist).toFixed(1)} cm
                      </span>
                    </div>
                  )}
                </div>
                <Ruler className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">% Gordura</p>
                  <p className="text-2xl font-bold">{latestMeasurement.body_fat_percentage ? `${latestMeasurement.body_fat_percentage}%` : '-'}</p>
                  {previousMeasurement?.body_fat_percentage && latestMeasurement.body_fat_percentage && (
                    <div className="flex items-center gap-1 mt-1">
                      {latestMeasurement.body_fat_percentage < previousMeasurement.body_fat_percentage ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-xs">
                        {Math.abs(latestMeasurement.body_fat_percentage - previousMeasurement.body_fat_percentage).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <Activity className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Completo</CardTitle>
          <CardDescription>
            Todos os seus registros de medidas ordenados por data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tiffany)]"></div>
              <p className="mt-4 text-sm text-gray-600">Carregando medidas...</p>
            </div>
          ) : measurements.length === 0 ? (
            <Alert>
              <AlertDescription>
                Você ainda não tem medidas registradas. Clique em "Nova Medida" para começar!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {measurements.map((measurement) => (
                <Card key={measurement.id} className="border-l-4 border-[var(--tiffany)]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-[var(--tiffany)]" />
                          <span className="font-semibold">
                            {format(new Date(measurement.measured_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {measurement.weight && (
                            <div>
                              <p className="text-xs text-gray-600">Peso</p>
                              <p className="font-semibold">{measurement.weight} kg</p>
                            </div>
                          )}
                          {measurement.waist && (
                            <div>
                              <p className="text-xs text-gray-600">Cintura</p>
                              <p className="font-semibold">{measurement.waist} cm</p>
                            </div>
                          )}
                          {measurement.hips && (
                            <div>
                              <p className="text-xs text-gray-600">Quadril</p>
                              <p className="font-semibold">{measurement.hips} cm</p>
                            </div>
                          )}
                          {measurement.chest && (
                            <div>
                              <p className="text-xs text-gray-600">Busto</p>
                              <p className="font-semibold">{measurement.chest} cm</p>
                            </div>
                          )}
                          {measurement.body_fat_percentage && (
                            <div>
                              <p className="text-xs text-gray-600">% Gordura</p>
                              <p className="font-semibold">{measurement.body_fat_percentage}%</p>
                            </div>
                          )}
                          {measurement.muscle_mass && (
                            <div>
                              <p className="text-xs text-gray-600">Massa Muscular</p>
                              <p className="font-semibold">{measurement.muscle_mass} kg</p>
                            </div>
                          )}
                        </div>

                        {measurement.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 mb-1">Observações:</p>
                            <p className="text-sm">{measurement.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(measurement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(measurement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
