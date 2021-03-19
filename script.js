console.log('running...');
const electron = require('electron');
const {ipcRenderer} = electron;
const axios = require('axios');

document.querySelector('form').addEventListener('submit',
    function submitForm(e){
        e.preventDefault();
        const input = `${document.querySelector('#scout-link').value}`.toLowerCase();
        console.log(input);
        if (!input){
            // Update UI - message
            document.querySelector('.message').textContent = "Please enter a value to connect";
            return;
        }

        // Update UI - message
        document.querySelector('.message').textContent = "Connecting...";
        document.querySelector('.checkmark').style.display = 'none';
        document.querySelector('.bouncer').style.visibility = 'visible';
        document.querySelector('.checkmark').style.animation = '';
        submitLinkCode(input);
    }
);

document.querySelector('[data-custom-menu="close"]').addEventListener("click", function (e) {
    ipcRenderer.send('close-me');
}); 
let animateState = 'reset';
document.querySelector('[data-custom-menu="close"]').addEventListener("mouseenter", function (e) {
    document.querySelector('.content').classList.add('cover-shadow');
    if (animateState === 'reset'){
        animateState = 'changing';
        document.querySelector('object').classList.remove('sizePulse');
        document.querySelector('object').classList.add('exitHover');
        setTimeout(()=>{
            document.querySelector('object').classList.remove('exitHover');
            setTimeout(()=>document.querySelector('object').classList.add('exitHoverLeave'),0);
            setTimeout(()=>document.querySelector('object').classList.remove('exitHoverLeave'),2000);
            setTimeout(()=>document.querySelector('object').classList.add('sizePulse'),2500);
        },2000);
        setTimeout(()=>animateState = 'reset',6500);
    }
}); 

document.querySelector('[data-custom-menu="close"]').addEventListener("mouseout", function (e) {
    
    // if(animateState === 'changing') return;
    document.querySelector('.content').classList.remove('cover-shadow');
}); 

const submitLinkCode = async (code)=>{
    let sendCode = `${code}`.replace(/\s/g,'%20');
    // HANDLE API CODE HERE

    axios(`https://api.probax.com.au/API/?action=scoutlink-new&arg1=${123}`)
    .then(({data:scoutData})=>{

        console.log(scoutData);

        let scoutLinkStatus, scoutLinkStatusText, username, encPassword, scoutSecretcode,tub, localStartTime, localEndTime;
        [scoutLinkStatus, scoutLinkStatusText, username, encPassword, scoutSecretcode, tub, localStartTime, localEndTime] = scoutData.split(':::::');

        // Dev - induce an artifical success state
            // scoutLinkStatus = 'OK';
        
        if(scoutLinkStatus === "OK"){
            // Build data to write to file
            const fileData = `${username}\n${encPassword}\n${scoutSecretcode}${scoutSecretcode}${tub}${localStartTime}${localEndTime}\n0\n`;
            // Send data to IPCMain to write to file
            ipcRenderer.send('code:submit',fileData);
            // Update UI - message
            document.querySelector('.message').textContent = 'Scout Linked Succesfully!';
            document.querySelector('.bouncer').style.visibility = 'hidden';
            document.querySelector('.checkmark').style.backgroundColor = 'white';
            document.querySelector('.checkmark').src = 'assets/img/green-checkmark.png';
            document.querySelector('.checkmark').style.display = 'block';
            document.querySelector('.checkmark').style.animation = 'zoomIn 1.5s ease-out';
            document.querySelector('[data-custom-menu="nav"]').classList.toggle('successBounce');
            document.querySelector(`object`).data = '';
            document.querySelector(`object`).data = 'assets/img/beehive.svg';
        }
        else{
            ipcRenderer.send('code:submitFail',scoutLinkStatusText);
            // Update UI - message
            document.querySelector('.message').textContent = scoutLinkStatusText;
            document.querySelector('.checkmark').style.animation = 'zoomIn 1.5s ease-out';
            document.querySelector('.checkmark').style.backgroundColor = 'transparent';
            document.querySelector('.checkmark').src = 'assets/img/red-x.png';
            document.querySelector('.checkmark').style.display = 'block';
            document.querySelector('.bouncer').style.visibility = 'hidden';
        }
    })
    .catch(err=>{
        document.querySelector('.message').textContent = 'Unable to connect with API! Try again.';
        console.err(err);
    });

};
