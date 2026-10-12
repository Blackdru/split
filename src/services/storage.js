const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');
const { AppError } = require('../middleware/error-handler');

class StorageService {
  static getClient() {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      return null;
    }
    return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  /**
   * Upload file buffer directly to Supabase Private Bucket
   */
  static async uploadFile({ storageKey, fileBuffer, mimeType }) {
    const supabase = this.getClient();
    if (!supabase) {
      throw new AppError('Supabase storage is not configured in environment.', 500);
    }

    const { data, error } = await supabase.storage
      .from(config.supabase.storageBucket)
      .upload(storageKey, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new AppError(`Failed to upload to Supabase Storage: ${error.message}`, 500);
    }

    return data;
  }

  /**
   * Create a signed URL for secure download/viewing of receipt attachments
   */
  static async getSignedDownloadUrl(storageKey, expiresIn = 3600) {
    const supabase = this.getClient();
    if (!supabase) {
      throw new AppError('Supabase storage is not configured in environment.', 500);
    }

    const { data, error } = await supabase.storage
      .from(config.supabase.storageBucket)
      .createSignedUrl(storageKey, expiresIn);

    if (error) {
      throw new AppError(`Failed to generate signed URL: ${error.message}`, 500);
    }

    return data.signedUrl;
  }

  /**
   * Create a pre-signed URL for direct client upload
   */
  static async createSignedUploadUrl(storageKey) {
    const supabase = this.getClient();
    if (!supabase) {
      throw new AppError('Supabase storage is not configured in environment.', 500);
    }

    const { data, error } = await supabase.storage
      .from(config.supabase.storageBucket)
      .createSignedUploadUrl(storageKey);

    if (error) {
      throw new AppError(`Failed to generate signed upload URL: ${error.message}`, 500);
    }

    return data;
  }

  /**
   * Delete file from private bucket
   */
  static async deleteFile(storageKey) {
    const supabase = this.getClient();
    if (!supabase) return;

    await supabase.storage
      .from(config.supabase.storageBucket)
      .remove([storageKey]);
  }
}

module.exports = StorageService;
