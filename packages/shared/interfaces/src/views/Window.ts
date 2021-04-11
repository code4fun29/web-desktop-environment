import type { View } from "@react-fullstack/fullstack";
import type { Icon } from "../shared/icon";
import type { Window } from "../shared/window";

export interface Input {
  title: string;
  name: string;
  icon: Icon;
  window: Window;
  background: string;
  setWindowState: (windowState: WindowState) => void;
  onClose: () => void;
}

export interface WindowState {
  minimized?: boolean;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

export default interface WindowViewInterface extends View<Input> {}
