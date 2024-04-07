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

    const rules = await response.json();
    setRules(rules);
  };

  const handleDeleteClick = (id: string) => {
    setShowDelete(id);
  };

return (
  <div>
    <Navigation />
    <div className="rules-container">
      {rules.length === 0 ? (
        <p>No rules available at the moment.</p>
      ) : (
        rules.map((rule) => (
          <div key={rule.id} className="rule-card">
            <h2 className="rule-title">{rule.name}</h2>
            <p className="rule-description">{rule.description}</p>
            <p>Action name: {rule.action}</p>
            <p>Trigger name: {rule.trigger}</p>
            <p>Active: {rule.active ? 'Yes' : 'No'}</p>
            <p>Last Use: {rule.lastUse}</p>
            <p>Multi Use: {rule.multiUse ? 'Yes' : 'No'}</p>
            <p>Sleep Time: {rule.sleepTime}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

}


export default Rules;