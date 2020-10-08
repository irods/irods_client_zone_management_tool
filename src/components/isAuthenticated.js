import React, { useState } from 'react';
import Cookies from 'js-cookie';

function isAuthenticated(){
    const [token, getToken] = useState('');
    getToken(Cookies.get('token'));
    console.log(token);
    return(
        <div>
            {token}
        </div>
    );
}

export default isAuthenticated;