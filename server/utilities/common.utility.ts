import constants from "../constants";

export class ColumnNumericTransformer {
  to(data?: number): number | undefined {
    return data;
  }

  from(data?: string | null): number | null {
    if (data === null || data === undefined) return null;
    const toNumber = parseFloat(data);
    if (isNaN(toNumber)) return null;
    return toNumber;
  }
}

export const isDuplicateEntryError = (error: any) => {
  const code = error?.code || error?.driverError?.code;
  return code === constants.ERROR_CODE.DUPLICATED;
};
