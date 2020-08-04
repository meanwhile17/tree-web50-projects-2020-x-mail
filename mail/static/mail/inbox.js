document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email() );

  // send the email
  document.querySelector('form').addEventListener('submit', () => send_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email() {


  //sending values by POST method
let url = "emails/sent"
fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
    recipients: document.querySelector('#compose-recipients').value,
    subject: document.querySelector('#compose-subject').value,
    body: document.querySelector('#compose-body').value
  }),
  redirect: 'follow'
})
.then(response => response.json())
.then(result => {

    // Print result
    console.log(result);
    if (result.message.includes('success')) {
      load_mailbox('sent');
    }

  })

event.preventDefault()
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails').style.display = 'none';
  document.querySelector('#single-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_to_email(data) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails').style.display = 'none';
  document.querySelector('#single-email').style.display = 'none';

// Pre fill the fields for a reply
  document.querySelector('#compose-recipients').value = data.sender;
  if (data.subject.startsWith('Re :')) {
    document.querySelector('#compose-subject').value = data.subject;
    }
  else {
  document.querySelector('#compose-subject').value = 'Re : ' + data.subject;
  }
  document.querySelector('#compose-body').value = 'On ' + data.timestamp + ' ' + data.sender + ' wrote : ' + data.body;

}

function load_mailbox(mailbox) {

  // clear the previous contents
  document.querySelector('#emails').innerHTML = '';

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails').style.display = 'block';
  document.querySelector('#single-email').style.display = 'none';

  // fetching emails
  let emailsURL = '/emails/' + `${mailbox}`
  let emails_data;
  fetch(emailsURL)
  .then(response => response.json())
  .then(emails => {
    emails_data = emails;
    // Print emails
    //console.log(emails);
    console.log(emails_data);

    // loop for emails & printout all emails
    var x;
    for (x in emails_data ) {
      // creating a link for every email
    let emailidURL = '/emails/' + `${emails_data[x].id}`
    // creating a div for every email
    const div = document.createElement('div');

    // adding event listener
    let emailid = `${emails_data[x].id}`
    div.addEventListener('click', () => open_email(emailid));

    // adding innerHTML
    div.id = `${emails_data[x].id}`
    div.innerHTML = ('<b>From : </b>' + emails_data[x].sender + '<b>  Subject : </b>' + emails_data[x].subject + '<b>  Timestamp : </b>' + emails_data[x].timestamp); // href link js code <a href=' + emailidURL + '  + '</a>'>
    div.style.cssText = "border: 1px solid #0091ea; padding: 10px; margin: 5px;";



    // checking if read or not and setting the background color
    if  (emails_data[x].read === true) {
      div.style.background = "#bdbdbd";
      }
    else {
    div.style.background = "#f5f5f5";
    }
    //
      document.querySelector('#emails').append(div);
    }

  });

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>Your ${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  }

function open_email(email_id)  {

  // clear previous values

  document.querySelector('#single-email').innerHTML = '';

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails').style.display = 'none';
  document.querySelector('#single-email').style.display = 'block';


  //marking email as 'read'
  let email_id_URL = 'emails/' + `${email_id}`
  fetch(email_id_URL, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  })
  // fetching email to read it
  fetch(email_id_URL)
  .then(response => response.json())
  .then(data => {

    // Print emails
    //console.log(emails);
    console.log(data);
  let email_data = data

  // creating a reply button
  const reply_button = document.createElement('button');
  reply_button.className = "btn btn-sm btn-outline-primary";
  reply_button.innerHTML = "Reply";
  reply_button.addEventListener('click', () => reply_to_email(data) )
  document.querySelector('#single-email').append(reply_button);


    // showing email
  const email = document.createElement('div');
  email.innerHTML = ('<b>From : </b>' + data.sender + '</br>'+ ' <b>  To : </b>' + data.recipients + ' </br> <b>  Subject : </b>' + data.subject + '</br> <b>  Timestamp : </b>' + data.timestamp + '</br></br></br> <b> Email : </b>' + data.body); // href link js code <a href=' + emailidURL + '  + '</a>'>
  email.style.cssText = "border: 1px solid #0091ea; padding: 10px; margin: 5px;";

  document.querySelector('#single-email').append(email);

  // creating a button to archive / unrachive an email
  const archive_button = document.createElement('button');
  archive_button.className = "btn btn-sm btn-outline-primary";
  if (data.archived === false) {
    archive_button.innerHTML = "Archive";
    archive_button.addEventListener('click', () => {
      fetch(email_id_URL, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true,
        })
      })
      load_mailbox('inbox')
    });

    }
  else {
    archive_button.innerHTML = "Unarchive";
    archive_button.addEventListener('click', () => {
      fetch(email_id_URL, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false,
  })
})
load_mailbox('inbox')
})

}
  document.querySelector('#single-email').append(archive_button);

// creating a button to reply to sender




  });


}
