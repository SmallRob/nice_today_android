const STORAGE_KEYS = {
  LAST_MIGRATED_APP_VERSION: 'app-migrations:last-app-version'
};

export async function runAppDataMigrations({ fromVersion, toVersion }) {
  const normalizedTo = (toVersion || '').toString().trim();
  if (!normalizedTo || normalizedTo === 'unknown') {
    return { ran: false, reason: 'unknown_target_version' };
  }

  const lastMigrated = localStorage.getItem(STORAGE_KEYS.LAST_MIGRATED_APP_VERSION);
  if (lastMigrated === normalizedTo) {
    return { ran: false, reason: 'already_ran', toVersion: normalizedTo };
  }

  const results = [];

  try {
    const migrationModule = await import('./dataMigration');
    if (migrationModule?.initDataMigration) {
      const migratedCount = migrationModule.initDataMigration();
      results.push({ id: 'dataMigration', migratedCount });
    }
  } catch (error) {
    results.push({ id: 'dataMigration', error: error?.message || String(error) });
  }

  try {
    const configMigrationModule = await import('./ConfigMigrationTool');
    const tool = configMigrationModule?.configMigrationTool;
    if (tool?.checkMigrationNeeded && tool?.performMigration) {
      const check = await tool.checkMigrationNeeded();
      if (check?.needed) {
        const report = await tool.performMigration();
        results.push({ id: 'configMigration', needed: true, report });
      } else {
        results.push({ id: 'configMigration', needed: false });
      }
    }
  } catch (error) {
    results.push({ id: 'configMigration', error: error?.message || String(error) });
  }

  try {
    localStorage.setItem(STORAGE_KEYS.LAST_MIGRATED_APP_VERSION, normalizedTo);
  } catch (error) {
    results.push({ id: 'migrationMarker', error: error?.message || String(error) });
  }

  return {
    ran: true,
    fromVersion: fromVersion || null,
    toVersion: normalizedTo,
    results
  };
}

