
/**
 * Aggregates material data for cumulative view.
 *
 * @param {Array} studies - The list of all studies for a program.
 * @returns {object} - An object containing the aggregated data and columns.
 */
export const calculateCumulativeData = (studies) => {
  if (!studies || studies.length === 0) {
    return { data: [], columns: [] };
  }

  const materialMap = new Map();

  studies.forEach((study) => {
    if (!study.materials) return;

    study.materials.forEach((material) => {
      if (materialMap.has(material.id)) {
        const existingMaterial = materialMap.get(material.id);

        existingMaterial.data.forEach((metricRow, index) => {
          const newMetricRow = material.data[index];
          for (const key in metricRow) {
            if (key !== 'metric') {
              metricRow[key] += newMetricRow[key];
            }
          }
        });

      } else {
        // Deep copy to avoid modifying the original data
        const newMaterial = JSON.parse(JSON.stringify(material));
        materialMap.set(newMaterial.id, newMaterial);
      }
    });
  });

  const aggregatedMaterials = Array.from(materialMap.values());

  // Handle consumption ratios for IP-PC relationships
  aggregatedMaterials.forEach((material) => {
    if (material.type === 'PC' && material.parentMaterialIds) {
      material.parentMaterialIds.forEach((parentId) => {
        const ipMaterial = materialMap.get(parentId);
        if (ipMaterial && ipMaterial.type === 'IP') {
          const pcDemand = material.data.find(d => d.metric.includes('Demand'));
          const ipDemand = ipMaterial.data.find(d => d.metric.includes('Demand'));

          if (pcDemand && ipDemand) {
            for (const key in pcDemand) {
              if (key !== 'metric') {
                ipDemand[key] += pcDemand[key] * (material.consumptionRatio || 1);
              }
            }
          }
        }
      });
    }
  });

  const cumulativeData = [];
  const columns = [
    { key: 'materialId', label: 'Material ID' },
    { key: 'metric', label: 'Metric' },
    ...aggregatedMaterials[0].columns.filter(c => c.key !== 'metric')
  ];

  aggregatedMaterials.forEach(material => {
    material.data.forEach(metricRow => {
      cumulativeData.push({
        materialId: material.id,
        ...metricRow
      });
    });
  });

  return { data: cumulativeData, columns };
};
