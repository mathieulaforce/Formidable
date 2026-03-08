import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, type ValidatorFn } from '@angular/forms';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import type { DynFieldConfig, DynFieldValidation, DynSelectField, DynTextareaField } from './models';

function buildValidators(validations?: DynFieldValidation[]): ValidatorFn[] {
  if (!validations) return [];
  return validations.map((v) => {
    switch (v.validator) {
      case 'required':
        return Validators.required;
      case 'min':
        return Validators.min(v.value as number);
      case 'max':
        return Validators.max(v.value as number);
      case 'minLength':
        return Validators.minLength(v.value as number);
      case 'maxLength':
        return Validators.maxLength(v.value as number);
      case 'email':
        return Validators.email;
      case 'pattern':
        return Validators.pattern(v.value as string);
    }
  });
}

function createFormGroup(fields: DynFieldConfig[]): FormGroup {
  const controls: Record<string, FormControl> = {};
  for (const field of fields) {
    const defaultValue = field.type === 'number' ? 0 : field.type === 'checkbox' ? false : '';
    controls[field.key] = new FormControl(defaultValue, {
      nonNullable: true,
      validators: buildValidators(field.validators),
    });
  }
  return new FormGroup(controls);
}

@Component({
  selector: 'dyn-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmInputImports, HlmLabelImports, HlmTextareaImports, HlmNativeSelectImports],
  template: `
    <form [formGroup]="formGroup()" (ngSubmit)="handleSubmit()" class="space-y-4">
      <div [class]="gridClass()">
        @for (field of fields(); track field.key) {
          <div [class.col-span-2]="columns() === 2 && fieldColSpan(field) >= 2">
            @switch (field.type) {
              @case ('text') {
                <div class="flex flex-col gap-2">
                  <label hlmLabel [for]="field.key">{{ field.label }}</label>
                  <input hlmInput [id]="field.key" [formControlName]="field.key" [placeholder]="field.placeholder ?? ''" />
                </div>
              }
              @case ('number') {
                <div class="flex flex-col gap-2">
                  <label hlmLabel [for]="field.key">{{ field.label }}</label>
                  <input
                    hlmInput
                    [id]="field.key"
                    type="number"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder ?? ''"
                  />
                </div>
              }
              @case ('textarea') {
                <div class="flex flex-col gap-2">
                  <label hlmLabel [for]="field.key">{{ field.label }}</label>
                  <textarea
                    hlmTextarea
                    [id]="field.key"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder ?? ''"
                    [rows]="asTextarea(field).rows ?? 4"
                  ></textarea>
                </div>
              }
              @case ('select') {
                <div class="flex flex-col gap-2">
                  <label hlmLabel [for]="field.key">{{ field.label }}</label>
                  <hlm-native-select [selectId]="field.key" [formControlName]="field.key">
                    <option value="" disabled>{{ field.placeholder ?? 'Select...' }}</option>
                    @for (opt of asSelect(field).options; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </hlm-native-select>
                </div>
              }
            }
          </div>
        }
      </div>
      <ng-content />
    </form>
  `,
})
export class DynFormComponent {
  readonly fields = input.required<DynFieldConfig[]>();
  readonly value = input<Record<string, unknown>>();
  readonly columns = input(1);

  readonly formSubmit = output<Record<string, unknown>>();

  readonly formGroup = computed(() => createFormGroup(this.fields()));

  readonly gridClass = computed(() => (this.columns() > 1 ? 'grid grid-cols-2 gap-4' : 'space-y-4'));

  constructor() {
    effect(() => {
      const val = this.value();
      if (val) {
        this.formGroup().patchValue(val);
      }
    });
  }

  get valid(): boolean {
    return this.formGroup().valid;
  }

  get invalid(): boolean {
    return this.formGroup().invalid;
  }

  patchValue(value: Record<string, unknown>): void {
    this.formGroup().patchValue(value);
  }

  getRawValue(): Record<string, unknown> {
    return this.formGroup().getRawValue();
  }

  reset(): void {
    this.formGroup().reset();
  }

  protected fieldColSpan(field: DynFieldConfig): number {
    return field.colSpan ?? this.columns();
  }

  protected asTextarea(field: DynFieldConfig): DynTextareaField {
    return field as DynTextareaField;
  }

  protected asSelect(field: DynFieldConfig): DynSelectField {
    return field as DynSelectField;
  }

  protected handleSubmit(): void {
    if (this.formGroup().invalid) return;
    this.formSubmit.emit(this.formGroup().getRawValue());
  }
}
