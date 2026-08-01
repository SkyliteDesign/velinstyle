export function buildCatalogProjection(registry) {
  return {
    version: registry.version,
    generatedAt: new Date().toISOString(),
    totals: {
      skills: (registry.skills || []).length,
      packs: (registry.packs || []).length,
      workflowGraphs: (registry.workflowGraphs || []).length,
      bundles: (registry.bundles || []).length,
      templates: (registry.templates || []).length,
      projects: (registry.projects || []).length,
    },
    skills: (registry.skills || []).map((skill) => ({
      id: skill.id,
      name: skill.name || skill.id,
      category: skill.category,
      priority: skill.priority,
      status: skill.status,
      confidence: skill.confidence,
      capabilities: skill.capabilities || [],
      description: skill.description || '',
    })),
    packs: registry.packs || [],
    workflowGraphs: (registry.workflowGraphs || []).map((item) => ({ id: item.id, name: item.name, entry: item.entry })),
    bundles: registry.bundles || [],
    templates: registry.templates || [],
    projects: registry.projects || [],
  };
}
