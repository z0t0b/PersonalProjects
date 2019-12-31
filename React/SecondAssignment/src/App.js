import React, { Component } from 'react';
import ValidationComponent from './ValidationComponent';
import CharComponent from './CharComponent';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      textLength: 0,
      usableLetterArray: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.deleteLetter = this.deleteLetter.bind(this);
  }

  handleChange(e) {
    let letterArray = e.target.value.split('');
    this.setState({
      text: e.target.value,
      textLength: e.target.value.length,
      usableLetterArray: letterArray
    });
  }

  deleteLetter(id) {
    let newLetterArray = this.state.usableLetterArray.slice(0, id);
    this.setState({
      text: newLetterArray.join(''),
      textLength: newLetterArray.length,
      usableLetterArray: newLetterArray
    });
  }

  render () {
    return (
      <div className="App">
        <ol>
          <li>Create an input field (in App component) with a change listener which outputs the length of the entered text below it (e.g. in a paragraph).</li>
          <li>Create a new component (=> ValidationComponent) which receives the text length as a prop</li>
          <li>Inside the ValidationComponent, either output "Text too short" or "Text long enough" depending on the text length (e.g. take 5 as a minimum length)</li>
          <li>Create another component (=> CharComponent) and style it as an inline box (=> display: inline-block, padding: 16px, text-align: center, margin: 16px, border: 1px solid black).</li>
          <li>Render a list of CharComponents where each CharComponent receives a different letter of the entered text (in the initial input field) as a prop.</li>
          <li>When you click a CharComponent, it should be removed from the entered text.</li>
        </ol>
        <p>Hint: Keep in mind that JavaScript strings are basically arrays!</p>
        <hr />
        <br />
        <input value={this.state.text} onChange={this.handleChange} />
        <ValidationComponent textLength={this.state.textLength} />
        {this.state.usableLetterArray.map((letter, id) => (
          <CharComponent key={letter} letter={letter} clickEvent={this.deleteLetter.bind(this, id)} />
        ))}
      </div>
    );
  }
}

export default App;
