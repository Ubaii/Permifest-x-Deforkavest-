'use server';

import { competitionRepository } from '@/lib/repositories';
import { createAdminClient } from '@/lib/supabase/admin';
import { Competition, RubricCriteria } from '@/lib/types';

/**
 * Query: Mendapatkan Seluruh Data Kompetisi
 */
export async function getCompetitionsQuery(): Promise<Competition[]> {
  try {
    return await competitionRepository.getAll();
  } catch (err) {
    console.error('[getCompetitionsQuery] Error:', err);
    return [];
  }
}

/**
 * Query: Mendapatkan Kompetisi Berdasarkan ID
 */
export async function getCompetitionByIdQuery(id: string): Promise<Competition | null> {
  try {
    return await competitionRepository.getById(id);
  } catch (err) {
    console.error(`[getCompetitionByIdQuery] Error for ${id}:`, err);
    return null;
  }
}

interface DbRubricRow {
  id: string;
  competition_id: string;
  name: string;
  description?: string | null;
  max_score?: number | null;
  weight?: number | null;
  position?: number | null;
}

/**
 * Query: Mendapatkan Kriteria Rubrik Penilaian per Lomba
 */
export async function getRubricCriteriaQuery(competitionId: string): Promise<RubricCriteria[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('rubric_criteria')
      .select('*')
      .eq('competition_id', competitionId)
      .order('position', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((r: DbRubricRow) => ({
      id: r.id,
      competition_id: r.competition_id,
      name: r.name,
      description: r.description || '',
      max_score: Number(r.max_score || 100),
      weight: Number(r.weight || 0),
      sort_order: Number(r.position || 1),
    }));
  } catch (err) {
    console.error(`[getRubricCriteriaQuery] Error for ${competitionId}:`, err);
    return [];
  }
}
