
          <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
            {/* //-------------------------Room Information______________________________________ */}
            <Typography style={{ marginBottom: '15px', marginTop: '15px' }} variant="h6">
              Room Information
            </Typography>
            <Grid container rowSpacing={3} columnSpacing={{ xs: 0, sm: 2 }}>
              {/* //room type  */}
              <Grid item xs={12} sm={12} md={6}>
                <FormLabel>Room Type</FormLabel>
                <Select
                  id="roomType"
                  name="roomType"
                  size="small"
                  fullWidth
                  value={formik.values.roomType}
                  onChange={handleRoomTypeChange}
                  error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                >
                  <MenuItem value="default" disabled>
                    Select Room Type
                  </MenuItem>
                  {roomData
                    ?.filter((room, index, self) => self.findIndex((r) => r.roomType === room.roomType) === index)
                    .map((rooms, index) => (
                      <MenuItem key={index} value={rooms?.roomType}>
                        {rooms?.roomType}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText error={formik.touched.roomType && formik.errors.roomType}>
                  {formik.touched.roomType && formik.errors.roomType}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormLabel>Room Number</FormLabel>
                <Select
                  id="roomNo"
                  name="roomNo"
                  size="small"
                  fullWidth
                  value={formik.values.roomNo}
                  onChange={handleChange}
                  error={formik.touched.roomNo && Boolean(formik.errors.roomNo)}
                >
                  <MenuItem value="default" disabled>
                    Select Room Number
                  </MenuItem>
                  {roomNumbers.map((roomNumber) => (
                    <MenuItem key={roomNumber} value={roomNumber}>
                      {roomNumber}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={formik.touched.roomNo && formik.errors.roomNo}>
                  {formik.touched.roomNo && formik.errors.roomNo}
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormLabel>Check-In Date</FormLabel>
                <TextField
                  id="checkInDate"
                  name="checkInDate"
                  size="small"
                  type="date"
                  fullWidth
                  value={formik.values.checkInDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true
                  }}
                  inputProps={{
                    min: today
                  }}
                  error={formik.touched.checkInDate && Boolean(formik.errors.checkInDate)}
                  helperText={formik.touched.checkInDate && formik.errors.checkInDate}
                />
              </Grid>
              {/* Check-Out Date */}
              <Grid item xs={12} sm={6}>
                <FormLabel>Check-Out Date</FormLabel>
                <TextField
                  id="checkOutDate"
                  name="checkOutDate"
                  size="small"
                  type="date"
                  fullWidth
                  value={formik.values.checkOutDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true
                  }}
                  inputProps={{
                    min: moment(formik.values.checkInDate).add(1, 'day').format('YYYY-MM-DD')
                  }}
                  error={formik.touched.checkOutDate && Boolean(formik.errors.checkOutDate)}
                  helperText={formik.touched.checkOutDate && formik.errors.checkOutDate}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormLabel>Amount</FormLabel>
                <TextField
                  id="amount"
                  name="amount"
                  size="small"
                  type="text"
                  fullWidth
                  // placeholder="Enter Phone "
                  disabled
                  value={`Rs ${amount}`}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormLabel>Advance Amount</FormLabel>
                <TextField
                  id="advanceAmount"
                  name="advanceAmount"
                  size="small"
                  type="number"
                  fullWidth
                  placeholder="Enter advance amount"
                  value={formik.values.advanceAmount}
                  onChange={handleTotalAmount}
                  error={formik.touched.advanceAmount && Boolean(formik.errors.advanceAmount)}
                  helperText={formik.touched.advanceAmount && formik.errors.advanceAmount}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormLabel>Total Amount</FormLabel>
                <TextField
                  id="totalAmount"
                  name="totalAmount"
                  size="small"
                  type="text"
                  fullWidth
                  disabled
                  value={`Rs ${amount - formik.values.advanceAmount}`}
                  error={formik.touched.totalAmount && Boolean(formik.errors.totalAmount)}
                  helperText={formik.touched.totalAmount && formik.errors.totalAmount}
                />
              </Grid>
            </Grid>
            {isLoading ? (
              <Typography>Loading........</Typography>
            ) : (
              <>
                {/* //------------------------- Customer Information______________________________________ */}
                <Typography style={{ marginBottom: '15px', marginTop: '15px' }} variant="h6">
                  Customer Information
                </Typography>
                <Grid container rowSpacing={3} columnSpacing={{ xs: 0, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <FormLabel>Phone Number</FormLabel>
                    <TextField
                      id="phoneNumber"
                      name="phoneNumber"
                      size="small"
                      type="number"
                      fullWidth
                      placeholder="Enter Phone Number"
                      value={formik.values.phoneNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        formik.setFieldValue('phoneNumber', value);
                      }}
                      error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                      helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormLabel>First Name</FormLabel>
                    <TextField
                      id="firstName"
                      name="firstName"
                      size="small"
                      fullWidth
                      placeholder="Enter First Name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormLabel>Last Name</FormLabel>
                    <TextField
                      id="lastName"
                      name="lastName"
                      size="small"
                      fullWidth
                      placeholder="Enter Last Name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormLabel>Email</FormLabel>
                    <TextField
                      id="email"
                      name="email"
                      size="small"
                      fullWidth
                      value={formik.values.email}
                      placeholder="Enter Email"
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <FormLabel>Id card Type</FormLabel>
                    <Select
                      id="idCardType"
                      name="idCardType"
                      size="small"
                      fullWidth
                      value={formik.values.idCardType}
                      onChange={formik.handleChange}
                      error={formik.touched.idCardType && Boolean(formik.errors.idCardType)}
                    >
                      <MenuItem value="default" disabled>
                        Select Id Card Type
                      </MenuItem>
                      <MenuItem value="Aadharcard">Aadhar Card</MenuItem>
                      <MenuItem value="VoterIdCard">VoterId Card</MenuItem>
                      <MenuItem value="PanCard">Pan Card</MenuItem>
                      <MenuItem value="DrivingLicense">Driving License</MenuItem>
                    </Select>
                    <FormHelperText error={formik.touched.idCardType && formik.errors.idCardType}>
                      {formik.touched.idCardType && formik.errors.idCardType}
                    </FormHelperText>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormLabel>Id Card Number</FormLabel>
                    <TextField
                      id="idcardNumber"
                      name="idcardNumber"
                      size="small"
                      type="text"
                      fullWidth
                      placeholder="Enter card number"
                      value={formik.values.idcardNumber}
                      onChange={formik.handleChange}
                      error={formik.touched.idcardNumber && Boolean(formik.errors.idcardNumber)}
                      helperText={formik.touched.idcardNumber && formik.errors.idcardNumber}
                    />
                  </Grid>

                  {existingCustomerData?.idFile ? (
                    <Grid item xs={12} sm={6}>
                      <FormLabel>Id Proof</FormLabel>

                      <Typography style={{ color: 'black', marginTop: '7px' }}>
                        <a href={existingCustomerData?.idFile} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <Button startIcon={<VisibilityIcon />} variant="contained" color="primary">
                            View ID Proof
                          </Button>
                        </a>
                      </Typography>
                    </Grid>
                  ) : (
                    <Grid item xs={12} sm={6}>
                      <FormLabel>Upload ID Card File</FormLabel>
                      <Input
                        id="idFile"
                        name="idFile"
                        type="file"
                        onChange={(event) => formik.setFieldValue('idFile', event.currentTarget.files[0])}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <FormLabel>Address</FormLabel>
                    <TextField
                      id="address"
                      name="address"
                      size="small"
                      fullWidth
                      placeholder="Enter Physical Address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Form fields for each person */}
            {personData.map((person, index) => (
              <div key={index}>
                <Typography style={{ marginBottom: '15px', marginTop: '15px' }} variant="h6">
                  Person {index + 1} Information
                </Typography>
                <>
                  {/* //------------------------- Customer Information______________________________________ */}

                  <Grid container rowSpacing={3} columnSpacing={{ xs: 0, sm: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <FormLabel>Phone Number</FormLabel>
                      <TextField
                        id="phoneNumber"
                        name="phoneNumber"
                        size="small"
                        type="number"
                        fullWidth
                        placeholder="Enter Phone Number"
                        value={formik.values.phoneNumber}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          formik.setFieldValue('phoneNumber', value);
                        }}
                        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                        helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormLabel>First Name</FormLabel>
                      <TextField
                        id="firstName"
                        name="firstName"
                        size="small"
                        fullWidth
                        placeholder="Enter First Name"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormLabel>Last Name</FormLabel>
                      <TextField
                        id="lastName"
                        name="lastName"
                        size="small"
                        fullWidth
                        placeholder="Enter Last Name"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormLabel>Email</FormLabel>
                      <TextField
                        id="email"
                        name="email"
                        size="small"
                        fullWidth
                        value={formik.values.email}
                        placeholder="Enter Email"
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                      <FormLabel>Id card Type</FormLabel>
                      <Select
                        id="idCardType"
                        name="idCardType"
                        size="small"
                        fullWidth
                        value={formik.values.idCardType}
                        onChange={formik.handleChange}
                        error={formik.touched.idCardType && Boolean(formik.errors.idCardType)}
                      >
                        <MenuItem value="default" disabled>
                          Select Id Card Type
                        </MenuItem>
                        <MenuItem value="Aadharcard">Aadhar Card</MenuItem>
                        <MenuItem value="VoterIdCard">VoterId Card</MenuItem>
                        <MenuItem value="PanCard">Pan Card</MenuItem>
                        <MenuItem value="DrivingLicense">Driving License</MenuItem>
                      </Select>
                      <FormHelperText error={formik.touched.idCardType && formik.errors.idCardType}>
                        {formik.touched.idCardType && formik.errors.idCardType}
                      </FormHelperText>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormLabel>Id Card Number</FormLabel>
                      <TextField
                        id="idcardNumber"
                        name="idcardNumber"
                        size="small"
                        type="text"
                        fullWidth
                        placeholder="Enter card number"
                        value={formik.values.idcardNumber}
                        onChange={formik.handleChange}
                        error={formik.touched.idcardNumber && Boolean(formik.errors.idcardNumber)}
                        helperText={formik.touched.idcardNumber && formik.errors.idcardNumber}
                      />
                    </Grid>

                    {existingCustomerData?.idFile ? (
                      <Grid item xs={12} sm={6}>
                        <FormLabel>Id Proof</FormLabel>

                        <Typography style={{ color: 'black', marginTop: '7px' }}>
                          <a href={existingCustomerData?.idFile} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                            <Button startIcon={<VisibilityIcon />} variant="contained" color="primary">
                              View ID Proof
                            </Button>
                          </a>
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={12} sm={6}>
                        <FormLabel>Upload ID Card File</FormLabel>
                        <Input
                          id="idFile"
                          name="idFile"
                          type="file"
                          onChange={(event) => formik.setFieldValue('idFile', event.currentTarget.files[0])}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <FormLabel>Address</FormLabel>
                      <TextField
                        id="address"
                        name="address"
                        size="small"
                        fullWidth
                        placeholder="Enter Physical Address"
                        value={formik.values.address}
                        onChange={formik.handleChange}
                        error={formik.touched.address && Boolean(formik.errors.address)}
                        helperText={formik.touched.address && formik.errors.address}
                      />
                    </Grid>
                  </Grid>
                </>
              </div>
            ))}
            <Button onClick={handleAddPerson}>Add More Person</Button>

            <DialogActions>
              <Button type="submit" variant="contained" color="primary">
                Add Reservation
              </Button>
            </DialogActions>
</form>
          


          <FieldArray
              name="customers"
              render={(arrayHelpers) => (
                <div>
                  {formik.values.customers.map((customer, index) => (
                    <div key={index}>
                      <>
                        {/* //------------------------- Customer Information______________________________________ */}
                        <Typography style={{ marginBottom: '15px', marginTop: '15px' }} variant="h6">
                          Customer Information
                        </Typography>
                        <Grid container rowSpacing={3} columnSpacing={{ xs: 0, sm: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <FormLabel>Phone Number</FormLabel>
                            <TextField
                              id={`customers.${index}.phoneNumber`}
                              name={`customers.${index}.phoneNumber`}
                              size="small"
                              type="number"
                              fullWidth
                              placeholder="Enter Phone Number"
                              value={formik.values.phoneNumber}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                formik.setFieldValue(`customers.${index}.phoneNumber`, value);
                              }}
                              error={
                                formik.errors.customers &&
                                formik.errors.customers.length &&
                                formik.errors.customers[index].phoneNumber &&
                                Boolean(formik.errors.phoneNumber)
                              }
                              // helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormLabel>First Name</FormLabel>
                            <TextField
                              id={`customers.${index}.firstName`}
                              name={`customers.${index}.firstName`}
                              size="small"
                              fullWidth
                              placeholder="Enter First Name"
                              value={formik.values.firstName}
                              onChange={formik.handleChange}
                              error={
                                formik.errors.customers &&
                                formik.errors.customers.length &&
                                formik.errors.customers[index].firstName &&
                                Boolean(formik.errors.firstName)
                              }
                              // helperText={formik.touched.firstName && formik.errors.firstName}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormLabel>Last Name</FormLabel>
                            <TextField
                              id={`customers.${index}.lastName`}
                              name={`customers.${index}.lastName`}
                              size="small"
                              fullWidth
                              placeholder="Enter Last Name"
                              value={formik.values.lastName}
                              onChange={formik.handleChange}
                              error={
                                formik.errors.customers &&
                                formik.errors.customers.length &&
                                formik.errors.customers[index].lastName &&
                                Boolean(formik.errors.lastName)
                              }
                              // helperText={formik.touched.lastName && formik.errors.lastName}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <FormLabel>Email</FormLabel>
                            <TextField
                              id={`customers.${index}.email`}
                              name={`customers.${index}.email`}
                              size="small"
                              fullWidth
                              value={formik.values.email}
                              placeholder="Enter Email"
                              onChange={formik.handleChange}
                              error={
                                formik.errors.customers &&
                                formik.errors.customers.length &&
                                formik.errors.customers[index].email &&
                                Boolean(formik.errors.email)
                              }
                              // helperText={formik.touched.email && formik.errors.email}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={6}>
                            <FormLabel>Id card Type</FormLabel>
                            <Select
                              id={`customers.${index}.idCardType`}
                              name={`customers.${index}.idCardType`}
                              size="small"
                              fullWidth
                              value={formik.values.idCardType}
                              onChange={formik.handleChange}
                              error={
                                formik.errors.customers &&
                                formik.errors.customers.length &&
                                formik.errors.customers[index].idCardType &&
                                Boolean(formik.errors.idCardType)
                              }
                            >
                              <MenuItem value="default" disabled>
                                Select Id Card Type
                              </MenuItem>
                              <MenuItem value="Aadharcard">Aadhar Card</MenuItem>
                              <MenuItem value="VoterIdCard">VoterId Card</MenuItem>
                              <MenuItem value="PanCard">Pan Card</MenuItem>
                              <MenuItem value="DrivingLicense">Driving License</MenuItem>
                            </Select>
                            {/* <FormHelperText error={formik.touched.idCardType && formik.errors.idCardType}>
                              {formik.touched.idCardType && formik.errors.idCardType}
                            </FormHelperText> */}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormLabel>Id Card Number</FormLabel>
                            <TextField
                              id={`customers.${index}.idcardNumber`}
                              name={`customers.${index}.idcardNumber`}
                              size="small"
                              type="text"
                              fullWidth
                              placeholder="Enter card number"
                              value={formik.values.idcardNumber}
                              onChange={formik.handleChange}
                              error={
                                formik.errors.customers &&
                                formik.errors.customers.length &&
                                formik.errors.customers[index].idcardNumber &&
                                Boolean(formik.errors.idcardNumber)
                              }
                              // helperText={formik.touched.idcardNumber && formik.errors.idcardNumber}
                            />
                          </Grid>

                          {existingCustomerData?.idFile ? (
                            <Grid item xs={12} sm={6}>
                              <FormLabel>Id Proof</FormLabel>

                              <Typography style={{ color: 'black', marginTop: '7px' }}>
                                <a href={existingCustomerData?.idFile} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                  <Button startIcon={<VisibilityIcon />} variant="contained" color="primary">
                                    View ID Proof
                                  </Button>
                                </a>
                              </Typography>
                            </Grid>
                          ) : (
                            <Grid item xs={12} sm={6}>
                              <FormLabel>Upload ID Card File</FormLabel>
                              <Input
                                id={`customers.${index}.idFile`}
                                name={`customers.${index}.idFile`}
                                type="file"
                                onChange={(event) => formik.setFieldValue(`customers.${index}.idFile`, event.currentTarget.files[0])}
                              />
                            </Grid>
                          )}

                          <Grid item xs={12} sm={6}>
                            <FormLabel>Address</FormLabel>
                            <TextField
                              id={`customers.${index}.address`}
                              name={`customers.${index}.address`}
                              size="small"
                              fullWidth
                              placeholder="Enter Physical Address"
                              value={formik.values.address}
                              onChange={formik.handleChange}
                              error={
                                formik.errors.customers &&
                                formik.errors.customers.length &&
                                formik.errors.customers[index].address &&
                                Boolean(formik.errors.address)
                              }
                              // helperText={formik.touched.address && formik.errors.address}
                            />
                          </Grid>
                        </Grid>
                      </>
                      {index !== 0 && (
                        <Button
                          type="button"
                          onClick={() => arrayHelpers.remove(index)} // remove a customer from the list
                        >
                          - Remove
                        </Button>
                      )}
                      {index === 0 && (
                        <Button
                          type="button"
                          onClick={() => arrayHelpers.insert(index, '')} // insert an empty string at a position
                        >
                          + Add
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            />