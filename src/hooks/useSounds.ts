import useSound from "use-sound";
import { ExposedData, PlayFunction } from "use-sound/dist/types";
import soundLinesCleared from "../assets/lines-cleared.mp3";
import soundTetris from "../assets/tetris.mp3";

export interface Sound {
  play: PlayFunction;
  data: ExposedData;
}

export type SoundKey = keyof ReturnType<typeof useSounds>;

export default function useSounds() {
  const useSoundWrapped = (url: string): Sound => {
    const ret = useSound(url);
    return { play: ret[0], data: ret[1] };
  };

  return {
    linesCleared: useSoundWrapped(soundLinesCleared),
    tetris: useSoundWrapped(soundTetris),
  };
}
