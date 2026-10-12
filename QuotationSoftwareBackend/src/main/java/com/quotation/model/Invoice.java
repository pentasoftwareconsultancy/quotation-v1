package com.quotation.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;

@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    private String invoiceNumber;
    private String invoiceDate;
    private String dueDate;
    private String quotationId;
    private String employeeId; // To fetch by employee later
    private String employeeName;
    
    // Client Details
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String clientAddress;
    
    private String projectName;
    private String totalAmount;
    private String taxRate;
    private String taxAmount;
    private String finalAmount;
    private String status;
    private String paymentTerms;
    private String advancePercentage;
    private double advancePaid;
    private String midwayPercentage;
    private double midwayPaid;
    private double finalPaymentPaid;
    private double totalPaidAmount;
    private double balanceAmount;
    private String paymentStatus;
    private String paymentMethod;
    
    // ✅ Custom Percentage & Carry-Forward Support
    private double carryForwardPercentage;
    private double adjustmentAmount; // ✅ Carry-forward amount from previous invoice
    private String customComment;
    private Map<String, String> bankDetails;

    // --- GETTERS AND SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }

    public String getClientAddress() { return clientAddress; }
    public void setClientAddress(String clientAddress) { this.clientAddress = clientAddress; }

    public String getFinalAmount() { return finalAmount; }
    public void setFinalAmount(String finalAmount) { this.finalAmount = finalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Map<String, String> getBankDetails() { return bankDetails; }
    public void setBankDetails(Map<String, String> bankDetails) { this.bankDetails = bankDetails; }
	public String getInvoiceDate() {
		return invoiceDate;
	}
	public void setInvoiceDate(String invoiceDate) {
		this.invoiceDate = invoiceDate;
	}
	public String getDueDate() {
		return dueDate;
	}
	public void setDueDate(String dueDate) {
		this.dueDate = dueDate;
	}
	public String getQuotationId() {
		return quotationId;
	}
	public void setQuotationId(String quotationId) {
		this.quotationId = quotationId;
	}
	public String getProjectName() {
		return projectName;
	}
	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}
	public String getTotalAmount() {
		return totalAmount;
	}
	public void setTotalAmount(String totalAmount) {
		this.totalAmount = totalAmount;
	}
	public String getTaxRate() {
		return taxRate;
	}
	public void setTaxRate(String taxRate) {
		this.taxRate = taxRate;
	}
	public String getTaxAmount() {
		return taxAmount;
	}
	public void setTaxAmount(String taxAmount) {
		this.taxAmount = taxAmount;
	}
	public String getPaymentTerms() {
		return paymentTerms;
	}
	public void setPaymentTerms(String paymentTerms) {
		this.paymentTerms = paymentTerms;
	}
	public String getPaymentMethod() { return paymentMethod; }
	public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
	
	public String getEmployeeName() {
		return employeeName;
	}
	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}
	public String getAdvancePercentage() {
		return advancePercentage;
	}
	public void setAdvancePercentage(String advancePercentage) {
		this.advancePercentage = advancePercentage;
	}
	public double getAdvancePaid() {
		return advancePaid;
	}
	public void setAdvancePaid(double advancePaid) {
		this.advancePaid = advancePaid;
	}
	public String getMidwayPercentage() {
		return midwayPercentage;
	}
	public void setMidwayPercentage(String midwayPercentage) {
		this.midwayPercentage = midwayPercentage;
	}
	public double getMidwayPaid() {
		return midwayPaid;
	}
	public void setMidwayPaid(double midwayPaid) {
		this.midwayPaid = midwayPaid;
	}
	public double getFinalPaymentPaid() {
		return finalPaymentPaid;
	}
	public void setFinalPaymentPaid(double finalPaymentPaid) {
		this.finalPaymentPaid = finalPaymentPaid;
	}
	public double getTotalPaidAmount() {
		return totalPaidAmount;
	}
	public void setTotalPaidAmount(double totalPaidAmount) {
		this.totalPaidAmount = totalPaidAmount;
	}
	public double getBalanceAmount() {
		return balanceAmount;
	}
	public void setBalanceAmount(double balanceAmount) {
		this.balanceAmount = balanceAmount;
	}
	public String getPaymentStatus() {
		return paymentStatus;
	}
	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}
	
	// ✅ Getters and Setters for Carry-Forward
	public double getCarryForwardPercentage() {
		return carryForwardPercentage;
	}
	public void setCarryForwardPercentage(double carryForwardPercentage) {
		this.carryForwardPercentage = carryForwardPercentage;
	}
	
	public double getAdjustmentAmount() {
		return adjustmentAmount;
	}
	public void setAdjustmentAmount(double adjustmentAmount) {
		this.adjustmentAmount = adjustmentAmount;
	}
	
	public String getCustomComment() {
		return customComment;
	}
	public void setCustomComment(String customComment) {
		this.customComment = customComment;
	}

   
}