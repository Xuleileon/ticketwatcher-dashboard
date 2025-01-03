import { supabase } from '@/integrations/supabase/client';
import type { CommutePreference } from '@/types/components';

export const database = {
  // 保存用户偏好设置
  async savePreferences(userId: string, preferences: CommutePreference) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          from_station: preferences.fromStation,
          to_station: preferences.toStation,
          morning_train_number: preferences.morningTrainNumber,
          evening_train_number: preferences.eveningTrainNumber,
          seat_type: preferences.seatType,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  },

  // 获取用户偏好设置
  async getPreferences(userId: string): Promise<CommutePreference | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        fromStation: data.from_station,
        toStation: data.to_station,
        morningTrainNumber: data.morning_train_number,
        eveningTrainNumber: data.evening_train_number,
        seatType: data.seat_type
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  },

  // 删除用户偏好设置
  async clearPreferences(userId: string) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing preferences:', error);
      return false;
    }
  }
};