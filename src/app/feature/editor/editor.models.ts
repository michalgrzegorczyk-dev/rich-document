import { SelectionInfo } from '../../util/selection.service';

export interface KeydownBlockEvent {
  type: 'keydown';
  index: number;
  event: KeyboardEvent;
}

export interface SelectionBlockEvent {
  type: 'selection';
  index: number;
  event: SelectionInfo;
}

export type BlockEvent = KeydownBlockEvent | SelectionBlockEvent;

export interface EditorBlocks {
  blocks: {
    content: string;
  }[];
}
