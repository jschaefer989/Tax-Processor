import { useMemo, useState } from "react";
import { StartBehavior } from "../api/StartBehavior";
import type { TaxBehavior } from "../api/TaxBehavior";

type UseStartBehaviorResult = {
    years: number[];
    names: string[];
    newYear: boolean;
    startBehavior: StartBehavior;
}

export function useStartBehavior(taxBehavior: TaxBehavior): UseStartBehaviorResult {
  const [years, setYears] = useState<number[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [newYear, setNewYear] = useState<boolean>(false);

  const startBehavior = useMemo(
    () => new StartBehavior(setYears, setNames, setNewYear, taxBehavior),
    [setYears, setNames, setNewYear, taxBehavior],
  );

  return {
    years,
    names,
    newYear,
    startBehavior,
  };
}
