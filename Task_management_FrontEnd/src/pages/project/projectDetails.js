import { useState, useEffect } from 'react';
import styles from './CreateProject.module.css';
import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/navbar/sidebar';
import TaskStatus from '../../components/TaskStatus';
import Status from '../../components/Status';
import Auth from '../auth/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Popup from '../../components/popup';
import Button from '@mui/material/Button';
// import Avatar from '@mui/material/Avatar';
// import AvatarGroup from '@mui/material/AvatarGroup';
const ProjectDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProjectName] = useState({});
  const [sessionProject, setSessionProject] = useState({});
  const [userData, setUserData] = useState([]);
  const [arr, setArr] = useState({});
  const [dataValidate, setDataValidate] = useState(false);
  // const[showModel,setShowModel]=useState(false);
  const [rearr, setnewArr] = useState(false)

  const myModel = (value = false) => {
    setDataValidate(value)
    // setShowModel(value)
  }

  useEffect(() => {
    if (location.state != null) {
      setnewArr(location.state.new_arr);
      myModel(location.state.fun)
    }
  }, [location.state]);

  useEffect(() => {
    const userData = Auth();

    if (!userData) {
      const notify = () => {
        toast.error("Please Login", {
          position: toast.POSITION.TOP_LEFT,
          closeButton: false,
        });
        navigate("/login");
      };
      notify();
      return;
    } else {
      setUserData(userData);

      const fetchData = async () => {
        try {
          const projectdata = JSON.parse(sessionStorage.getItem("projectdata"));
          setSessionProject(projectdata)
          const response = await fetch(`${process.env.REACT_APP_API_URL}/task/status/${projectdata.projectId
            }`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userData.token}`,
              "Content-Type": "application/json",
            },
          }).catch(e => console.log("error" + e));
          if (response.status === 403) {

            navigate("/login");
            return;
          }

          if (response.status === 204) {
            setDataValidate(true);
            return;
          }

          if (!response.ok) {
            const notify = () => {
              toast.error("Please Login", {
                position: toast.POSITION.TOP_LEFT,
                closeButton: false,
              });
              navigate("/login");
            };
            notify();
            setArr({ projectName: "No data Found", projectKey: "asdas" });
            return;
          } else {
            const responseData = await response.json();
            setProjectName(responseData.project)
            setArr(responseData);
          }
        } catch (error) {
          const notify = () => {
            toast.error("Please Login", {
              position: toast.POSITION.TOP_LEFT,
              closeButton: false,
            });
            navigate("/login");
          };
          notify();
          navigate("/");
          console.log(error);
          return;
        }
      };

      fetchData();
      if (rearr === true) {
        fetchData()
        setnewArr(false)
      }
    }

  }, [navigate, rearr]);

  return (
    <>
      <div className={styles.projectDetails}>
        <Sidebar projectName={project.projectName} userName={userData.userName} projectId={project.projectId} />
        <div className={styles.taskdetails}>
          <div>
            <h1>{!dataValidate && project.projectName}</h1>
          </div>
          <div className={styles.tasks}>
            {dataValidate &&
                <Popup closeModel={myModel} project={sessionProject.projectId} isOpen={true} projectName={sessionProject.projectName} />
            }
            {!dataValidate && <h1>Task</h1>}
            <div className={styles.task_details}>
              {arr.statusResponses && arr.statusResponses.map((statusResponse) => (
                <TaskStatus
                  key={statusResponse.status_id}
                  name={statusResponse.status.status}
                  status_id={statusResponse.status_id}
                  status_length={statusResponse.tasks.length}
                  status={statusResponse.tasks.map((task, i) => (
                    <div key={i}>
                      <Status name={task.task_summary} details={task.task_details} id={task.id} priority={task.priority} projectName={project.projectName} projectId={project.projectId} taskPopupData={task} />
                    </div>
                  ))}
                />
              ))}
              {!dataValidate &&
               <Button variant="outlined" onClick={() => myModel(true)}>
        +
      </Button>
               }

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
