import { ChangeEventHandler } from "react";
import { type Recipe } from "../../types/models";
import "./DropDown.css";

interface DropDownProps {
  id?: string;
  label: string;
  value: string;
  options: Recipe[] | string[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

const DropDown = ({ id, label, value, options, onChange }: DropDownProps) => {
  return (
    <div className="dropDownContainer">
      {label && <label htmlFor={id}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        id={id}
        className="dropDown"
      >
        {options.map((option) => (
          typeof option === "string"
            ? <option key={option} value={option}>{option}</option>
            : <option key={option.id} value={option.id}>{option.title}</option>
        ))}
      </select>
    </div>
  );
};

export default DropDown;
