const API = 'http://13.60.228.38:8000/api/';

import axios from 'axios';

export const getSummaryMetrics = (startDate: string, endDate: string) => {
    return new Promise((resolve, reject) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${API}summary?start_date=${startDate}&end_date=${endDate}`,
            headers: {
                'Content-Type': 'application/json',
            }
        };
          
        axios.request(config)
        .then((response) => {
            resolve(response?.data);
        })
        .catch((error) => {
            console.log(error);
            reject(error);
        });
    });
}



export const getMonthlySalesVolume = (startDate: string, endDate: string)=>{
return new Promise((resolve,reject)=>{
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${API}sales/monthly?start_date=${startDate}&end_date=${endDate}`,
        headers: { 
            'Content-Type': 'application/json',
        }
      };
      
      axios.request(config)
      .then((response) => {
        resolve(response?.data);
    })
    .catch((error) => {
        console.log(error);
        reject(error);
    });
      
})
}



export const getMonthlyRevenue = (startDate: string, endDate: string)=>{
    return new Promise((resolve,reject)=>{
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${API}revenue/monthly?start_date=${startDate}&end_date=${endDate}`,
            headers: { 
                'Content-Type': 'application/json',
            }
          };
          
          axios.request(config)
          .then((response) => {
            resolve(response?.data);
        })
        .catch((error) => {
            console.log(error);
            reject(error);
        });
          
    })
    }

export const getTabularData = (startDate: string, endDate: string, category: string, deliveryStatus: string, platform: string, state: string, page: number, limit: number) => {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();

        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (category) params.append('category', category);
        if (deliveryStatus) params.append('delivery_status', deliveryStatus);
        if (platform) params.append('platform', platform);
        if (state) params.append('state', state);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:8000/api/table?${params.toString()}`,
            headers: { 'Content-Type': 'application/json' }
        };

        axios.request(config)
            .then((response) => {
                resolve(response?.data);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });
}



export const getTopProducts = () =>{
    return new Promise((resolve,reject)=>{
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${API}topsp`,
            headers: { 
                'Content-Type': 'application/json',
            }
          };
          
          axios.request(config)
          .then((response) => {
            resolve(response?.data);
        })
        .catch((error) => {
            console.log(error);
            reject(error);
        });
          
    })
    }


    export const getOrderSalesByPlatform = () => {
        return new Promise((resolve,reject)=>{
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${API}orderbyplatform`,
                headers: { 
                    'Content-Type': 'application/json',
                }
              };
              
              axios.request(config)
              .then((response) => {
                resolve(response?.data);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
              
        })
        }
    