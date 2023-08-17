import { FunctionComponent } from "react";
import DatePicker from "react-datepicker";

interface DatePickerProps {
  label?: string;
  selected?: Date | null;
  onChange: (
    date: Date | null,
    event?: React.SyntheticEvent<any, Event>
  ) => void;
}

const DatePickerWrapper: FunctionComponent<DatePickerProps> = ({
  label,
  onChange,
  selected,
}) => {
  const wrapperStyles = {
    gap: 12,
    marginTop: 12,
    display: "flex",
    marginBottom: 12,
    alignItems: "center",
  };

  return (
    <div className="date-wrapper" style={wrapperStyles}>
      {label}
      <DatePicker selected={selected} onChange={onChange} />
    </div>
  );
};

export default DatePickerWrapper;
