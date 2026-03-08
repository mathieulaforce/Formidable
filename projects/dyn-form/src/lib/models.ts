export interface DynFieldValidation {
  validator: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email';
  value?: number | string;
  message?: string;
}

interface DynFieldBase {
  key: string;
  label: string;
  placeholder?: string;
  validators?: DynFieldValidation[];
  colSpan?: number;
}

export interface DynTextField extends DynFieldBase {
  type: 'text';
}

export interface DynNumberField extends DynFieldBase {
  type: 'number';
}

export interface DynTextareaField extends DynFieldBase {
  type: 'textarea';
  rows?: number;
}

export interface DynSelectOption {
  label: string;
  value: string;
}

export interface DynSelectField extends DynFieldBase {
  type: 'select';
  options: DynSelectOption[];
}

export interface DynCheckboxField extends DynFieldBase {
  type: 'checkbox';
}

export type DynFieldConfig =
  | DynTextField
  | DynNumberField
  | DynTextareaField
  | DynSelectField
  | DynCheckboxField;
