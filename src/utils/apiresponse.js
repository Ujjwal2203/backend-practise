class Apiresponse{
  constructor(
    statuscode,
    data,
    message = "success"
  ){
    this.statuscode = statuscode
    this.data = data
    this.message = message
    this.success = statuscode < 400
  }
}


// about status code 
/*
1) information response (100 - 199)
2) successful response(200-299)
3) redirectional message (300-399)
4) client error response (400-499)
5) server error response (500-599) */