import { useParams } from "react-router";
import "./learningStep.css";
import LearningFooter from "../LearningFooter/learningFooter";
import Step1 from "./Step1/step1";
import Step2 from "./Step2/step2";
import Step3 from "./Step3/step3";
import Step4 from "./Step4/step4";

const components: { [key: string]: React.FC } = {
  "1": Step1,
  "2": Step2,
  "3": Step3,
  "4": Step4,
};

const StepNotFound: React.FC = () => <div>Step not found</div>;

const LearningStep = () => {
  const { step } = useParams<{ step: string }>();

  //remove '1' if null return step not found
  const StepComponent = components[step ?? '1'] ?? StepNotFound;

  return (
    <div className="stepContainer">
      <StepComponent />
      <LearningFooter step={parseInt(step ?? '0')} />
    </div>
  );
};

export default LearningStep;
