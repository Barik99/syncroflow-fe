import Navigation from "./Navigation";
import {useEffect, useState} from "react";
import { Button, Modal } from "react-bootstrap";

interface Rule {
  id: string;
  name: string;
  action: string;
  active: boolean;
  lastUse: string | null;
  multiUse: boolean;
  sleepTime: number;
  trigger: string;
}
function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const email = window.localStorage.getItem('email');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const response = await fetch(`http://localhost:8080/rules/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

      const data = await response.json();
      console.log(data);

      // Check if data is an array before setting it
      if (Array.isArray(data)) {
        setRules(data);
      } else {
        console.error('Error: Expected array from API, received:', data);
      }
    };
  return (
      <div>
        <Navigation />
        <div className="container">
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary my-3" onClick={handleShow}>Create Rule</button>
          </div>
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Create Rule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className="mb-3">
                  <label htmlFor="ruleName" className="form-label">Name</label>
                  <input type="text" className="form-control" id="ruleName"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleAction" className="form-label">Action Name</label>
                  <input type="text" className="form-control" id="ruleAction"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleTrigger" className="form-label">Trigger Name</label>
                  <input type="text" className="form-control" id="ruleTrigger"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleLastUse" className="form-label">Last Use</label>
                  <input type="text" className="form-control" id="ruleLastUse"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleSleepTime" className="form-label">Sleep Time</label>
                  <input type="number" className="form-control" id="ruleSleepTime"/>
                </div>
                <div className="mb-3 form-check form-check-inline">
                  <input type="checkbox" className="form-check-input" id="ruleActive"/>
                  <label htmlFor="ruleActive" className="form-check-label">Active</label>
                </div>
                <div className="mb-3 form-check form-check-inline">
                  <label htmlFor="ruleMultiUse" className="form-label">Multi Use</label>
                  <input type="checkbox" className="form-check-input" id="ruleMultiUse"/>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Create
              </Button>
            </Modal.Footer>
          </Modal>
          {rules.length === 0 ? (
              <p>No rules available at the moment.</p>
          ) : (
              <div className="row">
                {rules.map((rule) => (
                    <div key={rule.id} className="col-lg-3">
                      <div className="card mb-3">
                        <div className="card-body">
                          <h5 className="card-title">{rule.name}</h5>
                          <p className="card-text">Action name: {rule.action}</p>
                          <p className="card-text">Trigger name: {rule.trigger}</p>
                          <p className="card-text">Active: {rule.active ? 'Yes' : 'No'}</p>
                          <p className="card-text">Last Use: {rule.lastUse}</p>
                          <p className="card-text">Multi Use: {rule.multiUse ? 'Yes' : 'No'}</p>
                          <p className="card-text">Sleep Time: {rule.sleepTime}</p>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}


export default Rules;