"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCustomFieldDefinitions,
  useCustomFieldValues,
  useSetCustomFieldValue,
} from "./use-custom-fields";

interface CustomFieldValuesProps {
  taskId: string;
  projectId: string;
}

/**
 * Renders each custom field defined for the project as an editable form field. Values are saved
 * optimistically on blur (text/number) or change (select/date). Loads definitions and values
 * in parallel.
 */
export function CustomFieldValues({ taskId, projectId }: CustomFieldValuesProps) {
  const { data: definitions, isLoading: defsLoading } = useCustomFieldDefinitions(projectId);
  const { data: values, isLoading: valuesLoading } = useCustomFieldValues(taskId);
  const setValue = useSetCustomFieldValue(taskId);

  if (defsLoading || valuesLoading) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Custom fields</p>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!definitions || definitions.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Custom fields</p>
      <div className="space-y-2">
        {definitions.map((field) => (
          <CustomFieldInput
            key={field.id}
            fieldId={field.id}
            name={field.name}
            fieldType={field.fieldType}
            options={field.options ?? []}
            value={values?.[field.id] ?? ""}
            onChange={async (val) => {
              try {
                await setValue.mutateAsync({ fieldId: field.id, value: val || null });
              } catch {
                toast.error(`Failed to save "${field.name}".`);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface CustomFieldInputProps {
  fieldId: string;
  name: string;
  fieldType: string;
  options: string[];
  value: string;
  onChange: (value: string) => Promise<void>;
}

function CustomFieldInput({ name, fieldType, options, value, onChange }: CustomFieldInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local state when the server value changes (e.g. after undo/reset)
  // Uses React's "adjusting state during render" pattern instead of useEffect
  // to avoid cascading renders flagged by react-hooks/set-state-in-effect.
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setLocalValue(value);
  }

  switch (fieldType) {
    case "TEXT":
      return (
        <Field>
          <FieldLabel>{name}</FieldLabel>
          <Input
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => {
              if (localValue !== value) onChange(localValue);
            }}
            placeholder={`Enter ${name.toLowerCase()}…`}
          />
        </Field>
      );
    case "NUMBER":
      return (
        <Field>
          <FieldLabel>{name}</FieldLabel>
          <Input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => {
              if (localValue !== value) onChange(localValue);
            }}
            placeholder={`Enter ${name.toLowerCase()}…`}
          />
        </Field>
      );
    case "SINGLE_SELECT":
      return (
        <Field>
          <FieldLabel>{name}</FieldLabel>
          <Select
            value={localValue}
            onValueChange={(v) => {
              setLocalValue(v);
              onChange(v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${name.toLowerCase()}…`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    case "DATE":
      return (
        <Field>
          <FieldLabel>{name}</FieldLabel>
          <Input
            type="date"
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              onChange(e.target.value);
            }}
          />
        </Field>
      );
    default:
      return null;
  }
}
