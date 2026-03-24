/**
 * Wealth service — pure helper functions for wealth data mutations.
 * All persistence goes through DataContext.
 */
import type { Property, SalaryRecord, SuperFund } from '@/types/wealth.types';

export function upsertProperty(
  properties: Property[],
  property: Property,
): Property[] {
  const index = properties.findIndex((p) => p.id === property.id);
  if (index >= 0) {
    const updated = [...properties];
    updated[index] = property;
    return updated;
  }
  return [...properties, property];
}

export function removeProperty(
  properties: Property[],
  propertyId: string,
): Property[] {
  return properties.filter((p) => p.id !== propertyId);
}

export function upsertSalaryRecord(
  records: SalaryRecord[],
  record: SalaryRecord,
): SalaryRecord[] {
  const index = records.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    const updated = [...records];
    updated[index] = record;
    return updated;
  }
  return [...records, record];
}

export function upsertSuperFund(
  funds: SuperFund[],
  fund: SuperFund,
): SuperFund[] {
  const index = funds.findIndex((f) => f.id === fund.id);
  if (index >= 0) {
    const updated = [...funds];
    updated[index] = fund;
    return updated;
  }
  return [...funds, fund];
}
