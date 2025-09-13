import { useParams, useNavigate } from "react-router-dom";
import BeachDetail from "@/components/BeachDetail";

const BeachDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate("/explore");
    return null;
  }

  return (
    <BeachDetail 
      beachId={id} 
      onBack={() => navigate("/explore")} 
    />
  );
};

export default BeachDetailPage;