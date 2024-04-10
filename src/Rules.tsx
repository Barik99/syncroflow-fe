import Navigation from "./Navigation";
import {useEffect, useState} from "react";

interface Rule {
  id: string;
  name: string;
  description: string;
  action: string;
  active: boolean;
  lastUse: string | null;
  multiUse: boolean;
  sleepTime: number;
  trigger: string;
}
function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [showDelete, setShowDelete] = useState<string | null>(null);
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
          {rules.length === 0 ? (
              <p>No rules available at the moment.</p>
          ) : (
              <div className="row">
                {rules.map((rule) => (
                    <div key={rule.id} className="col-lg-3">
                      <div className="card mb-3">
                        <div className="card-body">
                          <h5 className="card-title">{rule.name}</h5>
                          <p className="card-text">{rule.description}</p>
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