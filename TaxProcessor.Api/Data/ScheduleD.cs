using System.Runtime.CompilerServices;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

public class ScheduleD
{
    public int TotalOneD { get; set; } = 0;
    public int TotalOneE { get; set; } = 0;
    public int TotalOneG { get; set; } = 0;
    public int TotalTwoD { get; set; } = 0;
    public int TotalTwoE { get; set; } = 0;
    public int TotalTwoG { get; set; } = 0;
    public int TotalThreeD { get; set; } = 0;
    public int TotalThreeE { get; set; } = 0;
    public int TotalThreeG { get; set; } = 0;
    public int TotalOneH => TotalOneD - TotalOneE + TotalOneG;
    public int TotalTwoH => TotalTwoD - TotalTwoE + TotalTwoG;
    public int TotalThreeH => TotalThreeD - TotalThreeE + TotalThreeG;
    public int Seven => TotalOneH + TotalTwoH + TotalThreeH;
    public int TotalEightD { get; set; } = 0;
    public int TotalEightE { get; set; } = 0;
    public int TotalEightG { get; set; } = 0;
    public int TotalNineD { get; set; } = 0;
    public int TotalNineE { get; set; } = 0;
    public int TotalNineG { get; set; } = 0;
    public int TotalTenD { get; set; } = 0;
    public int TotalTenE { get; set; } = 0;
    public int TotalTenG { get; set; } = 0;
    public int TotalEightH => TotalEightD - TotalEightE + TotalEightG;
    public int TotalNineH => TotalNineD - TotalNineE + TotalNineG;
    public int TotalTenH => TotalTenD - TotalTenE + TotalTenG;
    public int Fifteen => TotalEightH + TotalNineH + TotalTenH;

    public ScheduleD() { }

    public void DetermineTotals(List<TaxResponse> responses)
    {
        int GetTotalForField(
            string formCode1,
            string formCode2,
            TaxFieldLabel label,
            List<TaxResponse> responses
        )
        {
            return responses
                .Where(response =>
                    (response.FormCode == formCode1 || response.FormCode == formCode2)
                    && response.Label == label
                )
                .Sum(response => int.TryParse(response.Value, out int value) ? value : 0);
        }

        TotalOneD = GetTotalForField("A", "G", TaxFieldLabel.oneD, responses);
        TotalOneE = GetTotalForField("A", "G", TaxFieldLabel.oneE, responses);
        TotalOneG = GetTotalForField("A", "G", TaxFieldLabel.oneG, responses);
        TotalTwoD = GetTotalForField("B", "H", TaxFieldLabel.oneD, responses);
        TotalTwoE = GetTotalForField("B", "H", TaxFieldLabel.oneE, responses);
        TotalTwoG = GetTotalForField("B", "H", TaxFieldLabel.oneG, responses);
        TotalThreeD = GetTotalForField("C", "I", TaxFieldLabel.oneD, responses);
        TotalThreeE = GetTotalForField("C", "I", TaxFieldLabel.oneE, responses);
        TotalThreeG = GetTotalForField("C", "I", TaxFieldLabel.oneG, responses);

        TotalEightD = GetTotalForField("D", "J", TaxFieldLabel.oneD, responses);
        TotalEightE = GetTotalForField("D", "J", TaxFieldLabel.oneE, responses);
        TotalEightG = GetTotalForField("D", "J", TaxFieldLabel.oneG, responses);
        TotalNineD = GetTotalForField("E", "K", TaxFieldLabel.oneD, responses);
        TotalNineE = GetTotalForField("E", "K", TaxFieldLabel.oneE, responses);
        TotalNineG = GetTotalForField("E", "K", TaxFieldLabel.oneG, responses);
        TotalTenD = GetTotalForField("F", "L", TaxFieldLabel.oneD, responses);
        TotalTenE = GetTotalForField("F", "L", TaxFieldLabel.oneE, responses);
        TotalTenG = GetTotalForField("F", "L", TaxFieldLabel.oneG, responses);
    }

    public void BuildResponses(List<TaxResponse> responses)
    {
        void AddResponse(TaxFieldLabel label, int value)
        {
            responses.Add(
                new TaxResponse(
                    form: TaxForm.ScheduleD,
                    label: label,
                    line: 0,
                    value: value.ToString()
                )
            );
        }

        AddResponse(TaxFieldLabel.oneD, TotalOneD);
        AddResponse(TaxFieldLabel.oneE, TotalOneE);
        AddResponse(TaxFieldLabel.oneG, TotalOneG);
        AddResponse(TaxFieldLabel.oneH, TotalOneH);
        AddResponse(TaxFieldLabel.twoD, TotalTwoD);
        AddResponse(TaxFieldLabel.twoE, TotalTwoE);
        AddResponse(TaxFieldLabel.twoG, TotalTwoG);
        AddResponse(TaxFieldLabel.twoH, TotalTwoH);
        AddResponse(TaxFieldLabel.threeD, TotalThreeD);
        AddResponse(TaxFieldLabel.threeE, TotalThreeE);
        AddResponse(TaxFieldLabel.threeG, TotalThreeG);
        AddResponse(TaxFieldLabel.threeH, TotalThreeH);
        AddResponse(TaxFieldLabel.seven, Seven);
        AddResponse(TaxFieldLabel.eightD, TotalEightD);
        AddResponse(TaxFieldLabel.eightE, TotalEightE);
        AddResponse(TaxFieldLabel.eightG, TotalEightG);
        AddResponse(TaxFieldLabel.eightH, TotalEightH);
        AddResponse(TaxFieldLabel.nineD, TotalNineD);
        AddResponse(TaxFieldLabel.nineE, TotalNineE);
        AddResponse(TaxFieldLabel.nineG, TotalNineG);
        AddResponse(TaxFieldLabel.nineH, TotalNineH);
        AddResponse(TaxFieldLabel.tenD, TotalTenD);
        AddResponse(TaxFieldLabel.tenE, TotalTenE);
        AddResponse(TaxFieldLabel.tenG, TotalTenG);
        AddResponse(TaxFieldLabel.tenH, TotalTenH);
        AddResponse(TaxFieldLabel.fifteen, Fifteen);
        AddResponse(TaxFieldLabel.sixteen, Seven + Fifteen);
    }
}
