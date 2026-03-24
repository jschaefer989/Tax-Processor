import { useMemo } from "react";
import ServerBehavior from "../api/ServerBehavior";

type UserServerBehaviorProps = {
  readonly onServerDown?: () => void;
};
type UseServerBehaviorResult = {
    serverBehavior: ServerBehavior;
};

export default function useServerBehavior(
  props?: UserServerBehaviorProps,
): UseServerBehaviorResult {
  const { onServerDown } = props ?? {};

  const serverBehavior = useMemo(() => {
    return new ServerBehavior(onServerDown);
  }, [onServerDown]);

  return { serverBehavior };
}
