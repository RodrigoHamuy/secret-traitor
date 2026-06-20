import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';
import { TextInput } from './TextInput';
import type { TextInputProps } from './TextInput';

export interface TokenFieldProps extends TextInputProps {
  note?: ReactNode;
}

export function TokenField({ note, className, ...rest }: TokenFieldProps) {
  return (
    <div className="mt-0.5 mb-1">
      <TextInput className={cx('[-webkit-text-security:disc]', className)} {...rest} />
      {note && <p className="mx-0.5 mt-1.5 text-xs leading-[1.45] text-muted">{note}</p>}
    </div>
  );
}
