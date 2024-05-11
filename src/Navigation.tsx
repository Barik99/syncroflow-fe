import React, { useState, useEffect } from "react";
import { Form, OverlayTrigger, Tooltip, Navbar, Nav, Toast, Offcanvas } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import { Dropdown } from 'react-bootstrap';

function Navigation() {
    const email = window.localStorage.getItem('email');
    // @ts-ignore
    const [isToggled, setIsToggled] = useState(JSON.parse(localStorage.getItem('isToggled')) || false);
    const [selectedTime, setSelectedTime] = useState(localStorage.getItem('selectedTime') || "");
    const [selectedDuration, setSelectedDuration] = useState(localStorage.getItem('selectedDuration') || "Set Duration");
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

    useEffect(() => {
        // Save to localStorage whenever selectedTime, selectedDuration or isToggled changes
        localStorage.setItem('selectedTime', selectedTime);
        localStorage.setItem('selectedDuration', selectedDuration);
        localStorage.setItem('isToggled', JSON.stringify(isToggled));
    }, [selectedTime, selectedDuration, isToggled]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleToggle = () => {
        setIsToggled(!isToggled);

        let timeValue = selectedTime;
        if (selectedDuration === "1") { // If "Seconds" is selected
            // @ts-ignore
            timeValue *= 1;
        }
        if (selectedDuration === "2") { // If "Minutes" is selected
            // @ts-ignore
            timeValue *= 60;
        }
        if (selectedDuration === "3") { // If "Hours" is selected
            // @ts-ignore
            timeValue *= 3600;
        }

        if (!isToggled) { // If the scheduler is not running, start it
            const url = `/api/schedulerStart/${email}/${timeValue}`;
            console.log(url);
            fetch(url, {
                method: 'POST',
            })
                .then(response => response.text())
                .then(data => {
                    console.log('Success:', data);
                    setToastMessage(data);
                    setShowToast(true);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setToastMessage(`Error: ${error}`);
                    setShowToast(true);
                });
        } else { // If the scheduler is running, stop it
            const url = `/api/schedulerStop/${email}`;
            console.log(url);
            fetch(url, {
                method: 'POST',
            })
                .then(response => response.text())
                .then(data => {
                    console.log('Success:', data);
                    setToastMessage(data);
                    setShowToast(true);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setToastMessage(`Error: ${error}`);
                    setShowToast(true);
                });
        }
    }
// @ts-ignore
    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
    }
// @ts-ignore
    const handleDurationChange = (event) => {
        setSelectedDuration(event.target.value);
    }
// @ts-ignore
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            You need to select a time frame
        </Tooltip>
    );
// @ts-ignore
    const renderTimeTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            You need to enter the time amount
        </Tooltip>
    );

    const handleKeyPressSchedulerTimeField = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value + e.key;
        // @ts-ignore
        if (!Number.isInteger(Number(value)) || value < 1 || e.key === '0') {
            e.preventDefault();
        }
    };

    const handleLogout = () => {
        // Clear the user's session
        window.localStorage.removeItem('email');
        // Redirect the user to the login page
        window.location.href = '/login';
    };

    return (
        <div>
            {isMobile ? (
                <>
                    <Button variant="primary" onClick={() => setShow(true)} className="me-2" style={{marginTop: '1rem', marginLeft: '2rem'}}>
                        &#9776;
                    </Button>

                    <Offcanvas show={show} onHide={() => setShow(false)} className="offcanvas-dark">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>
                                <img src="..\images\logo.png" alt="logo" className={"site-logo"} style={{paddingLeft: '0.5rem'}}/>
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="d-flex flex-column justify-content-between">
                            <Nav className="flex-column offcanvas-dark">
                                {email && (
                                    <>
                                        <Nav.Link href="/rules" className="transparent-button">Rules</Nav.Link>
                                        <Nav.Link href="/triggers" className="transparent-button">Triggers</Nav.Link>
                                        <Nav.Link href="/actions" className="transparent-button">Actions</Nav.Link>
                                    </>
                                )}
                                <Nav.Link href="/file-explorer" className="transparent-button">File Explorer</Nav.Link>
                            </Nav>
                            <div style={{
                                position: 'absolute',
                                bottom: '1rem',
                                left: 0,
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '0 1rem'
                            }}>
                                {email ? (
                                    <>
                                        <Navbar.Text className="login-button text-white"
                                                     style={{backgroundColor: 'rgba(0, 0, 0, 0)', border: 'none', paddingLeft: '0.3rem'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16" style={{marginRight: '0.5rem'}}>
                                                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                                            </svg>
                                            {email}
                                        </Navbar.Text>
                                        <Nav.Link onClick={handleLogout}
                                                  style={{padding: '0.25rem 0.5rem', marginRight: '0.5rem'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                 fill="currentColor" className="bi bi-box-arrow-right"
                                                 viewBox="0 0 16 16">
                                                <path fill-rule="evenodd"
                                                      d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                                <path fill-rule="evenodd"
                                                      d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                                            </svg>
                                        </Nav.Link>
                                    </>
                                ) : (
                                    <Nav.Link href="/login">
                                        <Button className="login-button text-white"
                                                style={{backgroundColor: 'rgba(0, 0, 0, 0)', border: 'none'}}>
                                            Login
                                        </Button>
                                    </Nav.Link>
                                )}
                            </div>
                        </Offcanvas.Body>
                    </Offcanvas>
                </>
            ) : (
                <Navbar bg="dark" variant="dark">
                    <Navbar.Brand href="/">
                        <img src="..\images\logo.png" alt="logo" className={"site-logo"}/>
                    </Navbar.Brand>
                    <Nav className="mr-auto">
                        {email && (
                            <Nav.Link href="/rules">Rules</Nav.Link>
                        )}
                        {email && (
                            <Nav.Link href="/triggers">Triggers</Nav.Link>
                        )}
                        {email && (
                            <Nav.Link href="/actions">Actions</Nav.Link>
                        )}
                        <Nav.Link href="/file-explorer">File Explorer</Nav.Link>
                    </Nav>
                    <Navbar.Collapse className="justify-content-end">
                        <Form className="scheduler-container">
                            <Form.Control type="number" onKeyPress={handleKeyPressSchedulerTimeField}
                                          placeholder="Scheduler time" disabled={isToggled} value={selectedTime}
                                          onChange={handleTimeChange} min="1"/>
                            <Form.Select aria-label="Default select example" disabled={isToggled}
                                         value={selectedDuration} onChange={handleDurationChange}>
                                <option>Set Duration</option>
                            <option value="1">Seconds</option>
                            <option value="2">Minutes</option>
                            <option value="3">Hours</option>
                        </Form.Select>
                        {email === null ? (
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip id="button-tooltip">You need to login to start the scheduler</Tooltip>}
                            >
                            <span className="d-inline-block">
                                <Button
                                    variant={isToggled ? "danger" : "success"}
                                    onClick={handleToggle}
                                    disabled={true}
                                >
                                    {isToggled ? "Stop" : "Start"}
                                </Button>
                            </span>
                            </OverlayTrigger>
                        ) : selectedDuration === "Set Duration" ? (
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltip}
                            >
                            <span className="d-inline-block">
                                <Button
                                    variant={isToggled ? "danger" : "success"}
                                    onClick={handleToggle}
                                    disabled={selectedDuration === "Set Duration" || selectedTime === ""}
                                >
                                    {isToggled ? "Stop" : "Start"}
                                </Button>
                            </span>
                            </OverlayTrigger>
                        ) : selectedTime === "" ? (
                            <OverlayTrigger
                                placement="bottom"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTimeTooltip}
                            >
                            <span className="d-inline-block">
                                <Button
                                    variant={isToggled ? "danger" : "success"}
                                    onClick={handleToggle}
                                    disabled={selectedDuration === "Set Duration" || selectedTime === ""}
                                >
                                    {isToggled ? "Stop" : "Start"}
                                </Button>
                            </span>
                            </OverlayTrigger>
                        ) : (
                            <Button
                                variant={isToggled ? "danger" : "success"}
                                onClick={handleToggle}
                                disabled={selectedDuration === "Set Duration" || selectedTime === ""}
                            >
                                {isToggled ? "Stop" : "Start"}
                            </Button>
                        )}
                        {email === null ? (
                            <Nav.Link href="/login">
                                <Button className="login-button text-white" style={{backgroundColor: 'rgba(0, 0, 0, 0)', border: 'none'}}>
                                    Login
                                </Button>
                            </Nav.Link>
                        ) : (
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic" className="login-button text-white" style={{backgroundColor: 'rgba(0, 0, 0, 0)', border: 'none'}}>
                                    {email}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </Form>
                </Navbar.Collapse>
            </Navbar>
            )}
            <Toast
                className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage === 'Scheduler started' ||
                toastMessage === 'Scheduler stopped' ? 'text-bg-success' : 'text-bg-danger'}`}
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={5000}
                autohide
            >
                <div className="d-flex">
                    <div className="toast-body">
                        {toastMessage}
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)} aria-label="Close"></button>
                </div>
            </Toast>
        </div>
    );
}

export default Navigation;