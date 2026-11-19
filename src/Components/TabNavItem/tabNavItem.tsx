import "./tabNavItem.css";

interface tabNavItemProps {
  id: string;
  title: string;
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabNavItem = ({ id, title, activeTab, setActiveTab }: tabNavItemProps) => {
  const handleClick = () => {
    setActiveTab(id)
  }

  return (
    <button
      onClick={handleClick}
      className={activeTab === id ? "active selector" : "inactive selector"}
      role="tab"
      aria-selected={activeTab === id}
    >
      {title}
    </button>
  );
};

export default TabNavItem;
