'use client';

import 'client-only';
import { useEffect, useState } from 'react';
import { DayPicker, DayPickerSingleProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { twJoin } from 'tailwind-merge';
import { ServerResponse } from '@/features/shared/data-access/ServerResponse';
import { Dialog } from '@/features/shared/ui/dialog/Dialog';
import { CalendarMonthIcon } from '@/features/shared/ui/icon/CalendarMonthIcon';
import { XIcon } from '@/features/shared/ui/icon/XIcon';
import { formatTaskDueDate, getTaskDueDateClassName } from './formatTaskDueDate';
import { TaskDto, updateTask } from '../data-access/TasksDataAccess';

export interface TaskDueDatePickerProps {
  readonly defaultDate?: Date | undefined;
  readonly name?: string;
  readonly onChange: (response: ServerResponse<TaskDto | undefined>) => void;
  readonly taskId?: string;
}

export const TaskDueDatePicker = ({
  defaultDate,
  name,
  onChange,
  taskId,
}: TaskDueDatePickerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    setSelectedDate(defaultDate);
  }, [defaultDate]);

  const handleChange = async (date: Date | undefined) => {
    setSelectedDate(date);
    setIsDialogOpen(false);

    if (!taskId) return;

    date?.setHours(new Date().getHours());
    date?.setMinutes(new Date().getMinutes());

    const formData = new FormData();
    formData.append('id', taskId);
    formData.append('dueDate', date === undefined ? 'null' : String(date));

    const response = await updateTask(undefined, formData);

    if (onChange) onChange(response);
  };

  const datePickerProps: DayPickerSingleProps = {
    captionLayout: 'dropdown-buttons',
    disabled: { before: new Date() },
    fixedWeeks: true,
    fromMonth: new Date(),
    fromYear: new Date().getFullYear(),
    ISOWeek: true,
    mode: 'single',
    modifiersClassNames: {
      selected: '!bg-primary !text-primary-foreground !opacity-100',
      today: 'font-semibold text-primary',
    },
    onSelect: handleChange,
    selected: selectedDate,
    showOutsideDays: true,
    toYear: new Date().getFullYear() + 2,
  };

  const chipButtonClassName = 'flex h-8 items-center transition-colors hover:bg-muted';

  const openDialogButton = (
    <button
      type="button"
      className={twJoin(
        chipButtonClassName,
        'gap-1.5 px-2.5 text-sm',
        selectedDate ? 'rounded-l-lg' : 'rounded-lg',
        getTaskDueDateClassName(selectedDate, new Date()),
      )}
    >
      <span className="sr-only">Add due date</span>
      <CalendarMonthIcon aria-hidden="true" width="1.125rem" height="1.125rem" />
      <span>{formatTaskDueDate(selectedDate, new Date())}</span>
    </button>
  );

  return (
    <div className="flex flex-row rounded-lg border border-border">
      {name && (
        <input type="hidden" name={name} value={selectedDate ? selectedDate.toString() : ''} />
      )}
      <Dialog
        className="md:w-auto"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onOpenAutoFocus={(event: Event) => event.preventDefault()}
        trigger={openDialogButton}
        noCloseButton
      >
        <div className="flex grow justify-center">
          <DayPicker {...datePickerProps} />
        </div>
      </Dialog>
      {selectedDate && (
        <button
          type="button"
          className={twJoin(
            chipButtonClassName,
            'rounded-r-lg border-l border-border px-1.5 text-muted-foreground hover:text-foreground',
          )}
          onClick={() => handleChange(undefined)}
        >
          <span className="sr-only">Remove due date</span>
          <XIcon aria-hidden="true" width="1rem" height="1rem" />
        </button>
      )}
    </div>
  );
};
