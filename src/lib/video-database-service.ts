/**
 * Serviço para gerenciar vídeos de exercícios no banco de dados
 * Substitui o sistema hardcoded de queslo-videos.ts
 */

import { supabase } from './supabase'

export interface ExerciseVideoFromDB {
  id: string
  exercise_name: string
  youtube_video_id: string
  youtube_url: string
  embed_url: string
  thumbnail_url: string
  channel_name: string
  muscle_group: string | null
  description: string | null
  is_active: boolean
  view_count: number
  created_at: string
}

export interface AddVideoInput {
  exercise_name: string
  youtube_url_or_id: string
  channel_name?: string
  muscle_group?: string
  description?: string
}

/**
 * Extrai o ID do vídeo de uma URL do YouTube
 */
export function extractYouTubeVideoId(urlOrId: string): string {
  const url = urlOrId.trim()
  
  // Se já é só o ID (11 caracteres alfanuméricos)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }
  
  // youtube.com/watch?v=XXXXX
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]
  
  // youtu.be/XXXXX
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]
  
  // youtube.com/embed/XXXXX
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]
  
  // youtube.com/shorts/XXXXX
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shortsMatch) return shortsMatch[1]
  
  // Retorna como está (pode ser inválido)
  return url
}

/**
 * Busca vídeo por nome do exercício no banco de dados
 */
export async function getVideoByExerciseName(exerciseName: string): Promise<ExerciseVideoFromDB | null> {
  try {
    const normalizedName = exerciseName.toLowerCase().trim()
    
    const { data, error } = await supabase
      .from('exercise_videos')
      .select('*')
      .eq('exercise_name_normalized', normalizedName)
      .eq('is_active', true)
      .single()
    
    if (error) {
      // Se não encontrou exato, tenta busca parcial
      const { data: partialData, error: partialError } = await supabase
        .from('exercise_videos')
        .select('*')
        .ilike('exercise_name_normalized', `%${normalizedName}%`)
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (partialError) {
        console.warn(`⚠️ Vídeo não encontrado para: "${exerciseName}"`)
        return null
      }
      
      return partialData
    }
    
    return data
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error)
    return null
  }
}

/**
 * Lista todos os vídeos do banco de dados
 */
export async function getAllVideos(): Promise<ExerciseVideoFromDB[]> {
  try {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select('*')
      .order('exercise_name', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao listar vídeos:', error)
    return []
  }
}

/**
 * Lista vídeos por grupo muscular
 */
export async function getVideosByMuscleGroup(muscleGroup: string): Promise<ExerciseVideoFromDB[]> {
  try {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select('*')
      .eq('muscle_group', muscleGroup.toLowerCase())
      .eq('is_active', true)
      .order('exercise_name', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao listar vídeos por grupo muscular:', error)
    return []
  }
}

/**
 * Adiciona novo vídeo (apenas admin)
 */
export async function addVideo(input: AddVideoInput): Promise<{ success: boolean; error?: string; data?: ExerciseVideoFromDB }> {
  try {
    const videoId = extractYouTubeVideoId(input.youtube_url_or_id)
    
    if (!videoId || videoId.length !== 11) {
      return { success: false, error: 'ID do vídeo inválido. Use uma URL do YouTube ou o ID de 11 caracteres.' }
    }
    
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('exercise_videos')
      .insert({
        exercise_name: input.exercise_name.trim(),
        exercise_name_normalized: input.exercise_name.toLowerCase().trim(),
        youtube_video_id: videoId,
        channel_name: input.channel_name || 'Queslo Sistemas',
        muscle_group: input.muscle_group?.toLowerCase() || null,
        description: input.description || null,
        added_by: user?.user?.id || null
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'Este vídeo já existe para este exercício.' }
      }
      throw error
    }
    
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro ao adicionar vídeo:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { success: false, error: errorMessage }
  }
}

/**
 * Atualiza vídeo existente (apenas admin)
 */
export async function updateVideo(
  videoId: string, 
  updates: Partial<Pick<ExerciseVideoFromDB, 'exercise_name' | 'youtube_video_id' | 'channel_name' | 'muscle_group' | 'description' | 'is_active'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: Record<string, unknown> = { ...updates }
    
    // Se mudou o youtube_video_id, extrair o ID
    if (updates.youtube_video_id) {
      updateData.youtube_video_id = extractYouTubeVideoId(updates.youtube_video_id)
    }
    
    // Se mudou o exercise_name, atualizar o normalizado também
    if (updates.exercise_name) {
      updateData.exercise_name_normalized = updates.exercise_name.toLowerCase().trim()
    }
    
    const { error } = await supabase
      .from('exercise_videos')
      .update(updateData)
      .eq('id', videoId)
    
    if (error) throw error
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro ao atualizar vídeo:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { success: false, error: errorMessage }
  }
}

/**
 * Remove vídeo (soft delete - apenas desativa)
 */
export async function deleteVideo(videoId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('exercise_videos')
      .update({ is_active: false })
      .eq('id', videoId)
    
    if (error) throw error
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro ao deletar vídeo:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { success: false, error: errorMessage }
  }
}

/**
 * Remove vídeo permanentemente (hard delete)
 */
export async function hardDeleteVideo(videoId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('exercise_videos')
      .delete()
      .eq('id', videoId)
    
    if (error) throw error
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro ao deletar vídeo permanentemente:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { success: false, error: errorMessage }
  }
}

/**
 * Verifica se usuário é admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.email) return false
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.user.email)
      .single()
    
    if (error) return false
    return !!data
  } catch {
    return false
  }
}

/**
 * Incrementa contador de visualizações
 */
export async function incrementViewCount(videoId: string): Promise<void> {
  try {
    await supabase.rpc('increment_video_view', { video_id: videoId })
  } catch (error) {
    console.warn('Não foi possível incrementar visualização:', error)
  }
}

/**
 * Busca vídeos para usar no treino (substitui getQuesloVideo)
 */
export async function getExerciseVideoForWorkout(exerciseName: string): Promise<{
  videoId: string
  embedUrl: string
  thumbnailUrl: string
  channelName: string
} | null> {
  const video = await getVideoByExerciseName(exerciseName)
  
  if (!video) return null
  
  return {
    videoId: video.youtube_video_id,
    embedUrl: video.embed_url,
    thumbnailUrl: video.thumbnail_url,
    channelName: video.channel_name
  }
}



