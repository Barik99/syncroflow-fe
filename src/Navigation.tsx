import React, { useState, useEffect } from "react";
import { Form, OverlayTrigger, Tooltip, Navbar, Nav, Toast } from "react-bootstrap";
import Button from 'react-bootstrap/Button';

function Navigation() {
    const email = window.localStorage.getItem('email') || 'Login';
    // @ts-ignore
    const [isToggled, setIsToggled] = useState(JSON.parse(localStorage.getItem('isToggled')) || false);
    const [selectedTime, setSelectedTime] = useState(localStorage.getItem('selectedTime') || "");
    const [selectedDuration, setSelectedDuration] = useState(localStorage.getItem('selectedDuration') || "Set Duration");
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Save to localStorage whenever selectedTime, selectedDuration or isToggled changes
        localStorage.setItem('selectedTime', selectedTime);
        localStorage.setItem('selectedDuration', selectedDuration);
        localStorage.setItem('isToggled', JSON.stringify(isToggled));
    }, [selectedTime, selectedDuration, isToggled]);

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

    return (
        <div>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="/">
                    <img src="..\images\logo.png" alt="logo" className={"site-logo"}/>
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="/rules">Rules</Nav.Link>
                    <Nav.Link href="/triggers">Triggers</Nav.Link>
                    <Nav.Link href="/actions">Actions</Nav.Link>
                    <Nav.Link href="/file-explorer">File Explorer</Nav.Link>
                </Nav>
                <Navbar.Collapse className="justify-content-end">
                    <Form className="scheduler-container">
                        <Form.Control type="number" onKeyPress={handleKeyPressSchedulerTimeField} placeholder="Scheduler time" disabled={isToggled} value={selectedTime} onChange={handleTimeChange} min="1"/>
                        <Form.Select aria-label="Default select example" disabled={isToggled} value={selectedDuration} onChange={handleDurationChange}>
                            <option>Set Duration</option>
                            <option value="1">Seconds</option>
                            <option value="2">Minutes</option>
                            <option value="3">Hours</option>
                        </Form.Select>
                        {selectedDuration === "Set Duration" ? (
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
                            </OverlayTrigger>) : (
                            <Button
                                variant={isToggled ? "danger" : "success"}
                                onClick={handleToggle}
                                disabled={selectedDuration === "Set Duration" || selectedTime === ""}
                            >
                                {isToggled ? "Stop" : "Start"}
                            </Button>
                        )}
                        <Nav.Link href="/login" className="login-button text-white">
                            {email}
                        </Nav.Link>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
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