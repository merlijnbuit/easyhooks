import React, { Component } from 'react';
import { Button, TextField, DropdownSelect } from '@tableau/tableau-ui';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverUrl: '',
      site: '',
      username: '',
      password: '',
      signInUser: '',
      token: '',
      siteId: '',
      url: '',
      hook: 'webhook-source-event-datasource-refresh-started',
      hookList: [],
      name: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleServerUrl = this.handleServerUrl.bind(this);
    this.handleSite = this.handleSite.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleUsername = this.handleUsername.bind(this);
    this.handleURL = this.handleURL.bind(this);
    this.handleHook = this.handleHook.bind(this);
    this.handleCreateWebhook = this.handleCreateWebhook.bind(this);
    this.remove = this.remove.bind(this);
    this.handleName = this.handleName.bind(this);
  }

  handleAnswerSignin() {
    let answser = this.state.signInUser;
    var XMLParser = require('react-xml-parser');
    var xml = new XMLParser().parseFromString(answser);
    if (xml.getElementsByTagName('credentials')[0] !== undefined) {
      this.setState({
        token: xml.getElementsByTagName('credentials')[0].attributes.token,
        siteId: xml.getElementsByTagName('site')[0].attributes.id,
      });
    }
  }

  signInUser() {
    // create a new XMLHttpRequest
    var xhr = new XMLHttpRequest();
    // get a callback when the server responds
    xhr.addEventListener('load', () => {
      console.log(xhr.responseText);

      // update the state of the component with the result here
      this.setState({ signInUser: xhr.responseText });
      if (this.state.signInUser !== '') {
        this.handleAnswerSignin();
        this.getHooks();
      }
    });

    xhr.open('POST', `${this.state.serverUrl}/api/3.6/auth/signin`);
    xhr.withCredentials = true;

    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE');

    xhr.send(
      `<tsRequest>
        <credentials
          name="${this.state.username}"
          password="${this.state.password}" 
        >
        <site contentUrl="${this.state.site}" />
        </credentials>
        </tsRequest>`
    );
  }

  getHooks() {
    // create a new XMLHttpRequest
    var req = new XMLHttpRequest();
    // get a callback when the server responds
    req.addEventListener('load', () => {
      let answser = req.responseText;
      var XMLParser = require('react-xml-parser');
      var xml = new XMLParser().parseFromString(answser);
      this.setState({ hookList: xml.getElementsByTagName('webhook') });
    });

    req.open('GET', `${this.state.serverUrl}/api/3.6/sites/${this.state.siteId}/webhooks`);
    req.setRequestHeader('X-Tableau-Auth', this.state.token);

    req.send();
  }

  handleSubmit(event) {
    event.preventDefault();
    //this.signInUser(this.state.username, this.state.password);
    this.signInUser(this.state.username, this.state.password);
  }

  handleUsername(event) {
    this.setState({ username: event.target.value });
  }

  handleServerUrl(event) {
    this.setState({ serverUrl: event.target.value });
  }

  handleSite(event) {
    this.setState({ site: event.target.value });
  }

  handleURL(event) {
    this.setState({ url: event.target.value });
  }

  handleName(event) {
    this.setState({ name: event.target.value });
  }
  handlePassword(event) {
    this.setState({ password: event.target.value });
  }

  handleHook(event) {
    this.setState({ hook: event.target.value });
  }

  handleCreateWebhook(event) {
    event.preventDefault();
    var xhr = new XMLHttpRequest();
    // get a callback when the server responds
    xhr.addEventListener('load', () => {
      // update the state of the component with the result here
      this.getHooks();
    });

    xhr.open('POST', `${this.state.serverUrl}/api/3.6/sites/${this.state.siteId}/webhooks`);
    xhr.setRequestHeader('X-Tableau-Auth', this.state.token);

    console.log(this.state.url);
    xhr.send(
      '<tsRequest>' +
        "<webhook name='" +
        this.state.name +
        "'>" +
        '<webhook-source>' +
        '<' +
        this.state.hook +
        '/>' +
        '</webhook-source>' +
        '<webhook-destination>' +
        "<webhook-destination-http method='POST' url='" +
        this.state.url +
        "'/>" +
        '</webhook-destination>' +
        '</webhook>' +
        '</tsRequest>'
    );
  }

  makeItNice(hook) {
    let name = '';
    if (hook === 'webhook-source-event-datasource-refresh-started')
      name = 'Datasource Refresh Started';
    else if (hook === 'webhook-source-event-datasource-refresh-succeeded')
      name = 'Datasource Refresh Succeeded';
    else if (hook === 'webhook-source-event-datasource-refresh-failed')
      name = 'Datasource Refresh Failed';
    else if (hook === 'webhook-source-event-datasource-updated') name = 'Datasource Updated';
    else if (hook === 'webhook-source-event-datasource-created') name = 'Datasource Created';
    else if (hook === 'webhook-source-event-datasource-deleted') name = 'Datasource Deleted';
    else if (hook === 'webhook-source-event-workbook-updated') name = 'Workbook Updated';
    else if (hook === 'webhook-source-event-workbook-created') name = 'Workbook Created';
    else if (hook === 'webhook-source-event-workbook-deleted') name = 'Workbook Deleted';
    else if (hook === 'webhook-source-event-workbook-refresh-started')
      name = 'Workbook Refresh Started';
    else if (hook === 'webhook-source-event-workbook-created') name = 'Workbook Created';
    else if (hook === 'webhook-source-event-workbook-refresh-succeededed')
      name = 'Workbook Refresh Succeeded';
    else if (hook === 'webhook-source-event-workbook-refresh-failed')
      name = 'Workbook Refresh Failed';
    else name = '';
    return name;
  }

  remove(id) {
    var del = new XMLHttpRequest();
    // get a callback when the server responds
    del.addEventListener('load', () => {
      // update the state of the component with the result here
      this.getHooks();
    });

    del.open('DELETE', `${this.state.serverUrl}/api/3.6/sites/${this.state.siteId}/webhooks/${id}`);

    del.setRequestHeader('X-Tableau-Auth', this.state.token);

    del.send();
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        {this.state.signInUser === '' ? (
          <div style={{ padding: 50 }}>
            <h1 style={{ fontSize: 90, marginBottom: 0 }}>EasyHooks Login</h1>
            <h1 style={{ fontSize: 15, marginBottom: 25 }}>
              No information is stored on our servers. Refreshing the page will remove all session
              data.
            </h1>
            <form onSubmit={this.handleSubmit}>
              <TextField
                label="Tableau Server URL"
                placeholder="https://10ax.online.tableau.com"
                style={{ width: 300 }}
                id="text"
                type="text"
                name="serverUrl"
                onChange={this.handleServerUrl}
              />
              <br />
              <TextField
                label="Tableau Site (leave empty for default)"
                style={{ width: 300 }}
                id="text"
                type="text"
                name="site"
                onChange={this.handleSite}
              />
              <br />
              <TextField
                label="Username"
                style={{ width: 300 }}
                id="Password"
                type="text"
                name="username"
                onChange={this.handleUsername}
              />
              <br />
              <TextField
                label="Password"
                id="Password"
                style={{ width: 300 }}
                type="password"
                name="username"
                onChange={this.handlePassword}
              />
              <Button
                kind="primary"
                style={{ display: 'block', margin: 'auto', marginTop: 12 }}
                type="submit"
                onClick={() => this.handleSubmit}
                value="Start using EasyHooks!"
              >
                Log in!
              </Button>
            </form>
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: 50 }}>Add EasyHook</h1>
            <form onSubmit={this.handleCreateWebhook}>
              <span style={{ display: 'block' }}>
                <TextField
                  label="Webhook Name"
                  type="text"
                  style={{ width: 300 }}
                  name="name"
                  onChange={this.handleName}
                />
              </span>
              <span style={{ display: 'block' }}>
                <TextField
                  label="Handle URL"
                  style={{ width: 300 }}
                  type="text"
                  name="name"
                  placeholder="A Handle URL (For example Zapier or IFTTT"
                  onChange={this.handleURL}
                />
              </span>
              <span style={{ display: 'block', marginTop: 12 }}>
                <span style={{ display: 'block', fontSize: 10 }}>Select hook type</span>
                <DropdownSelect onChange={this.handleHook}>
                  <option value="webhook-source-event-datasource-refresh-started">
                    Datasource Refresh Started
                  </option>
                  <option value="webhook-source-event-datasource-refresh-succeeded">
                    Datasource Refresh Succeeded
                  </option>
                  <option value="webhook-source-event-datasource-refresh-failed">
                    Datasource Refresh Failed
                  </option>
                  <option value="webhook-source-event-datasource-updated">
                    Datasource Updated
                  </option>
                  <option value="webhook-source-event-datasource-created">
                    Datasource Created
                  </option>
                  <option value="webhook-source-event-datasource-deleted">
                    Datasource Deleted
                  </option>
                  <option value="webhook-source-event-workbook-updated">Workbook Updated</option>
                  <option value="webhook-source-event-workbook-created">Workbook Created</option>
                  <option value="webhook-source-event-workbook-deleted">Workbook Deleted</option>
                  <option value="webhook-source-event-workbook-refresh-started">
                    Workbook Refresh Started
                  </option>
                  <option value="webhook-source-event-workbook-created">Workbook Created</option>
                  <option value="webhook-source-event-workbook-refresh-succeededed">
                    Workbook Refresh Succeeded
                  </option>
                  <option value="webhook-source-event-workbook-refresh-failed">
                    Workbook Refresh Failed
                  </option>
                </DropdownSelect>
              </span>
              <Button
                type="submit"
                style={{ display: 'block', margin: 'auto', marginTop: 25 }}
                kind="primary"
                value="Start using EasyHooks!"
              >
                Add Webhook
              </Button>
            </form>
            {this.state.hookList !== 0 && <h1 style={{ fontSize: 50 }}>Existing hooks</h1>}
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Remove</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
                {this.state.hookList.map((d, i) => (
                  <tr key={i + 'row'}>
                    <td key={d}>
                      <Button kind="destructive" onClick={() => this.remove(d.attributes.id)}>
                        Remove
                      </Button>
                    </td>
                    <td key={i + 'name'}>{d.attributes.name}</td>

                    <td key={i + 'source'}>
                      {this.makeItNice(
                        d.getElementsByTagName('webhook-source')[0].children[0].name
                      )}
                    </td>
                    <td key={i + 'dest'}>
                      {d.getElementsByTagName('webhook-destination-http')[0].attributes.url}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div />
        <h3 style={{ position: 'absolute', bottom: 0, left: 20 }}>
          EasyHooks is winner of the #data19 Hackathon and build by Merlijn Buit (
          <a href="https://twitter.com/MerlijnBuit" rel="noopener noreferrer" target="_blank">
            @merlijnbuit
          </a>
          ) and Tristan Guillevin (
          <a href="https://twitter.com/ladataviz" rel="noopener noreferrer" target="_blank">
            @ladataviz
          </a>
          )
        </h3>
      </div>
    );
  }
}

export default App;
