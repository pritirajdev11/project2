import { useState, useEffect } from 'react';
import AllStatusList from './AllStatusList';
import ProjectPriority from './ProjectPriority';
import styles from './TaskPopup.module.css';
import UserAssigne from './UserAssigne';
import InputForm from './from/InputForm';
import ButtonName from './from/ButtonName'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { BiTrash } from "react-icons/bi";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const TaskPopup = (k) => {
    const navigate = useNavigate();
    const [taskDetails, setTaskDetails] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [assignee, setAssignee] = useState('');
    const [reporter, setReporter] = useState('');
    const [statusList, setStatusList] = useState({});
    const [priority, setPriority] = useState({});
    const [value, setValue] = useState(true);
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    useEffect(() => {

        if (k.otherdata !== undefined) {
            const {
                task_summary,
                task_details,
                assignee: assigneeEmail,
                reporter: reporterEmail,
                projectStatus,
                priority: taskPriority
            } = k.otherdata;
            setTaskDetails(task_summary);
            setTaskDescription(task_details);
            setAssignee(assigneeEmail);
            setReporter(reporterEmail);
            const { status_id } = projectStatus;
            setStatusList({ status_id });
            setPriority(taskPriority);
        }
    }, [k.otherdata]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = {
            project_id: k.projectId,
            task_summary: taskDetails,
            task_details: taskDescription,
            assignee: assignee,
            reporter: reporter,
            status_id: statusList.status_id,
            priority_id: priority.priority_id
        };
        const requiredData = JSON.stringify(data);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('requiredData', requiredData)
        try {
            const userData = JSON.parse(sessionStorage.getItem("userData"));
            if (!userData || !userData.token) {
                const notify = () => {
                    toast.error('Token Not Present', {
                        position: toast.POSITION.TOP_LEFT,
                        closeButton: false
                    });
                };
                notify()
                return;
            }
            const response = await fetch(k.apiRequest, {
                method: k.apiMethod,
                body: formData,
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                },
            });

            // Check the response status
            if (response.ok) {
                const notify = () => {
                    toast.success("Task Added", {
                        position: toast.POSITION.TOP_LEFT,
                        closeButton: false
                    });
                    navigate('/project', { state: { new_arr: true } });
                    k.closeModel(false)
                };
                notify()
                setTaskDetails('');
                setTaskDescription('');
                setSelectedFile(null);
                setAssignee('');
                setReporter('');
            } else {
                const notify = () => {
                    toast.error("Something went wrong task Popup", {
                        position: toast.POSITION.TOP_LEFT,
                        closeButton: false
                    });
                };
                notify()
                console.log('Failed to create task');
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };
    const [open, setOpen] = useState(false);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const DeleteTask = async (taskId) => {
        try {
          const userData = JSON.parse(sessionStorage.getItem("userData"));
          if (!userData || !userData.token) {
            const notify = () => {
              toast.error("Token Not Present", {
                position: toast.POSITION.TOP_LEFT,
                closeButton: false,
              });
            };
            notify();
            return;
          }
      
          const response = await fetch(`http://localhost:8080/task/delete-task/${taskId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          });
      
          // Check the response status
          if (response.ok) {
            const notify = () => {
              toast.success("Task Deleted", {
                position: toast.POSITION.TOP_LEFT,
                closeButton: false,
              });
              navigate('/project', { state: { new_arr: true } });
              k.closeModel(false);
            };
            notify();
            setTaskDetails('');
            setTaskDescription('');
            setSelectedFile(null);
            setAssignee('');
            setReporter('');
          } else {
            const notify = () => {
              toast.error("Something went wrong while deleting the task", {
                position: toast.POSITION.TOP_LEFT,
                closeButton: false,
              });
            };
            notify();
            console.log('Failed to delete task');
          }
        } catch (error) {
          console.log('Error:', error);
        }
      };
    let reporter_value = (k.otherdata && k.otherdata.reporter ? k.otherdata.reporter : userData.email);
    const editTextArea=(show)=>{
        setValue(false)
    }
    return (
        <>
            <div className={styles.container}>
                <div className={styles.taskpopup}>
                    <div className={styles.closebar}>

                        {/* <div className={styles.editButton}><b>Create Issue</b><div id='delete_task' onClick={DeletePopup} className={styles.three_dots_more_info}><BiDotsHorizontalRounded size="1.5rem" color="rgba(6,90,215,1)" /></div></div>  */}
                        <div className={styles.editButton}><b>Create Issue</b>
                            {k.otherdata ? (
                                <Button variant="outlined" onClick={handleClickOpen}>
                                    <BiTrash size="1.5rem" color="rgba(6,90,215,1)" />
                                </Button>
                            ) : null}
                            <Dialog
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">
                                    {"You really want to delete this task"}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        You Wont retrive this task again
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleClose}>No</Button>
                                    <Button onClick={() => DeleteTask(k.otherdata.id)} autoFocus>
                                        Yes
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <p className={styles.closeButton} onClick={() => k.closeModel(false)}>
                            X
                        </p>
                    </div>
                    <div className={styles.taskAddDetails}>
                        <form id='CreateTask' onSubmit={handleSubmit} className={styles.CreateTask}>
                            <p>{k.projectName}</p>
                            <div>
                                <InputForm
                                    type="text"
                                    placeholder="Task Details"
                                    name="taskDetails"
                                    id="taskDetails"
                                    value={taskDetails}
                                    onChange={(event) => setTaskDetails(event.target.value)}
                                    width="100%"
                                />
                            </div>
                            <div>

                                
                                {k.otherdata ? (
                                    <div onClick={()=>editTextArea(true)}>
                                    {value?(
                                        <div>
                                        <b>Description</b>
                                    <div dangerouslySetInnerHTML={{ __html: k.otherdata.task_details }} />
                                        </div>
                                    ): <ReactQuill theme="snow" value={taskDescription} onChange={setTaskDescription}/>}
                                    </div>
                            ) :  <ReactQuill theme="snow" value={taskDescription} onChange={setTaskDescription} />}
                               
                            </div>
                            <div>
                                <UserAssigne name="assigne" onSelect={(user) => setAssignee(user)}
                                    alredayDefined={k.otherdata && k.otherdata.assignee}
                                />
                            </div>
                            <div>
                                <b>Reporter</b>
                                <p>{reporter_value}</p>
                            </div>
                            <div>
                                {/* <AllStatusList onSelect={(status) => setStatusList(status)} /> */}
                                <AllStatusList onSelect={(status) => setStatusList(status)}
                                    alredayDefined={k.otherdata && k.otherdata.projectStatus && k.otherdata.projectStatus.status}

                                />
                            </div>
                            <div>
                                <ProjectPriority onSelect={(priority) => setPriority(priority)}
                                    alredayDefined={k.otherdata && k.otherdata.priority}
                                />
                            </div>
                            <div>
                                <input type="file" onChange={handleFileChange} />
                            </div>
                            <ButtonName type="submit" buttonName="Submit" width="5.8rem" />
                        </form>

                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskPopup;